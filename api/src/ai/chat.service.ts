// src/ai/chat.service.ts
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { HotelGeminiService } from './hotel-gemini.service';
import { SheetsService } from './sheets.service';
import { BookingSchema, PartialBooking, BookingDto } from './dto/booking.dto';
import { TelegramService } from './telegram.service';
import { createCommitScheduler } from './libs/commit-scheduler';

type ProvisionalRecord = {
  id: string;
  sessionId?: string | null;
  booking: PartialBooking;
  createdAt: number;
  expiresAt: number;
  idempotencyKey?: string | null;
};

@Injectable()
export class ChatService implements OnModuleDestroy {
  private readonly logger = new Logger(ChatService.name);

  private commitScheduler = createCommitScheduler(); // 1 instance cho service
  private readonly IDLE_DELAY = 10000; // 5s (đổi thành 10000 cho 10s nếu muốn)

  // in-memory provisional records and committed keys (simple dedupe)
  private provisional = new Map<string, ProvisionalRecord>();
  private committedKeys = new Set<string>();

  // TTL default 15 minutes
  private readonly TTL = 15 * 60 * 1000;
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly gemini: HotelGeminiService,
    private readonly sheets: SheetsService,
    private readonly telegram: TelegramService,
  ) {
    // start cleanup loop
    this.cleanupInterval = setInterval(() => this.cleanupExpired(), 60 * 1000);
  }

  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
  }

  /**
   * Tìm provisional theo sessionId (trả về record hoặc null)
   */
  private findProvisionalBySession(
    sessionId?: string | null,
  ): ProvisionalRecord | null {
    if (!sessionId) return null;
    const now = Date.now();
    for (const rec of this.provisional.values()) {
      if (rec.sessionId === sessionId && rec.expiresAt > now) {
        return rec;
      }
    }
    return null;
  }

  /**
   * handleMessage
   * - message, chatHistory: from UI
   * - options: optional object { sessionId?, idempotencyKey? } (keeps compatibility)
   *
   * Return: { success, reply, provisionalId?, committed?:boolean, note? }
   */
  async handleMessage(
    message: string,
    chatHistory: any[],
    options?: { sessionId?: string; idempotencyKey?: string },
  ): Promise<{
    success: boolean;
    reply: string;
    provisionalId?: string | null;
    committed?: boolean;
    note?: string | null;
  }> {
    const sessionId = options?.sessionId ?? null;
    const idempotencyKey = options?.idempotencyKey ?? null;

    try {
      // If we have a provisional for this session, pass its booking as customerInfo to AI
      const provForSession = this.findProvisionalBySession(sessionId);
      const customerInfoToPass = provForSession ? provForSession.booking : null;

      // 1) call AI (pass existing partial booking so AI can gently ask for missing fields)
      const aiReply = await this.gemini.chatHotel(
        message,
        chatHistory,
        customerInfoToPass,
      );
      this.logger.debug(
        `AI reply for session ${sessionId || '-'}: ${JSON.stringify(aiReply)}`,
      );
      console.log('AI reply:', aiReply);

      // Ensure aiReply structure
      if (!aiReply || typeof aiReply !== 'object' || !aiReply.customerInfo) {
        this.logger.warn('AI trả về không có customerInfo, lưu provisional');
        const prov = await this.saveProvisional({
          sessionId,
          booking: {}, // nothing parsed
          idempotencyKey,
        });
        return {
          success: true,
          reply: aiReply?.message || 'Dạ em nhận được ạ.',
          provisionalId: prov.id,
          committed: false,
          note: 'AI không trả customerInfo',
        };
      }

      // 2) Validate/parse booking via BookingSchema (zod)
      const parseResult = await BookingSchema.safeParseAsync(
        aiReply.customerInfo,
      );

      // 2a) If parsed and valid
      if (parseResult.success) {
        // parseResult.data là BookingDto (hợp lệ)
        const booking: BookingDto = parseResult.data;

        // 3) Derive a dedupe key (prefer idempotencyKey if present)
        const dedupeKey = this.makeDedupeKey(booking, idempotencyKey);

        // 4) duplicate check (in-memory + optionally you can check Sheets via an index)
        if (this.committedKeys.has(dedupeKey)) {
          this.logger.log(
            `Duplicate booking prevented (dedupeKey=${dedupeKey})`,
          );
          // still respond to customer with friendly message but avoid double-book
          return {
            success: true,
            reply:
              'Dạ em đã ghi nhận yêu cầu trước đó rồi ạ. Nếu anh/chị muốn thay đổi thông tin hãy cho em biết ạ.',
            provisionalId: null,
            committed: false,
            note: 'duplicate',
          };
        }

        // 5) try to commit to Sheets
        try {
          // booking là BookingDto phù hợp với createBooking
          // if (aiReply.shouldCommit === true) {
          const key = sessionId ?? dedupeKey; // dùng sessionId ưu tiên, fallback dedupeKey
          const commitFn = async () => {
            try {
              await this.sheets.createBooking(booking);
              // mark committed
              this.committedKeys.add(dedupeKey);
              this.logger.log(`Booking committed (dedupeKey=${dedupeKey})`);

              await this.telegram.sendMessage(
                `📢 *Booking mới* 📢
👤 Tên: ${booking.name}
📞 Điện thoại: ${booking.phone}
📧 Email: ${booking.email ?? '-'}
🏨 Check-in: ${booking.checkin ?? '-'}
🏨 Check-out: ${booking.checkout ?? '-'}
🛏️ Loại phòng: ${booking.roomType ?? '-'}
🌙 Số đêm: ${booking.nights ?? '-'}
👥 Khách: ${booking.guests ?? '-'}
📝 Ghi chú: ${booking.note ?? '-'}
⚡ Trạng thái: ${booking.status ?? '-'}
🎯 Mức độ quan tâm: ${booking.bookingIntent?.category ?? '-'}
🔍 Lý do: ${booking.bookingIntent?.reasons?.join(', ') ?? '-'}
✅ Gợi ý hành động: ${booking.bookingIntent?.recommendedAction ?? '-'}`,
              );
            } catch (err) {
              this.logger.error('Auto-commit error', err);
              // optional: re-schedule, alert admin, or save provisional for manual retry
            }
          };

          // schedule commit after IDLE_DELAY ms; subsequent schedule(key,...) calls within delay will reset timer
          this.commitScheduler.schedule(key, commitFn, this.IDLE_DELAY);
          // if any provisional related to this dedupeKey, remove it
          // }
          this.removeProvisionalByIdempotencyKey(idempotencyKey, booking);
          return {
            success: true,
            reply: aiReply.message,
            provisionalId: null,
            committed: true,
            note: 'booked',
          };
        } catch (sheetErr) {
          this.logger.error('Lỗi khi lưu booking vào Sheets', sheetErr);
          // fallback: save provisional for later retry by agent
          const prov = await this.saveProvisional({
            sessionId,
            booking, // BookingDto ok as PartialBooking parameter
            idempotencyKey,
          });
          return {
            success: false,
            reply:
              'Dạ em xin lỗi, hiện tại hệ thống lưu trữ gặp vấn đề. Em đã tạm giữ thông tin và sẽ thông báo lại ạ.',
            provisionalId: prov.id,
            committed: false,
            note: 'sheet_error',
          };
        }
      } else {
        // 2b) invalid/incomplete: save provisional
        this.logger.warn(
          'Booking data không hợp lệ: ',
          parseResult.error.format(),
        );

        // attempt to keep AI-provided fields (normalized) where possible
        const cleaned: PartialBooking = this.normalizePartialBooking(
          aiReply.customerInfo,
        );

        // lấy danh sách field errors từ zod.flatten()
        const flat = parseResult.error.flatten
          ? parseResult.error.flatten()
          : null;
        const fieldErrors = flat && flat.fieldErrors ? flat.fieldErrors : {};
        const invalidFields = Object.keys(fieldErrors).filter(
          (k) =>
            Array.isArray((fieldErrors as any)[k]) &&
            (fieldErrors as any)[k].length > 0,
        );

        const prov = await this.saveProvisional({
          sessionId,
          booking: cleaned,
          idempotencyKey,
        });

        // Reply should be AI's message (AI will already ask naturally because we pass provisional into prompt)
        // put invalidFields into note so agent/UI can surface the exact missing fields if needed
        const note = invalidFields.length
          ? `missing_fields: ${invalidFields.join(',')}`
          : 'provisional_saved';

        return {
          success: true,
          reply: aiReply.message,
          provisionalId: prov.id,
          committed: false,
          note,
        };
      }
    } catch (err) {
      this.logger.error('handleMessage unexpected error', err);
      return {
        success: false,
        reply:
          'Xin lỗi anh/chị, hệ thống đang gặp lỗi. Vui lòng thử lại sau ạ.',
        provisionalId: null,
        committed: false,
        note: 'unexpected_error',
      };
    }
  }

  /**
   * commitProvisional
   * - commit a previously saved provisional record (called e.g. from webhook/agent)
   */
  async commitProvisional(
    provisionalId: string,
  ): Promise<{ success: boolean; message: string }> {
    const prov = this.provisional.get(provisionalId);
    if (!prov) {
      return {
        success: false,
        message: 'Không tìm thấy bản ghi tạm thời hoặc đã hết hạn.',
      };
    }

    // validate again
    const parsed = await BookingSchema.safeParseAsync(prov.booking);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Dữ liệu chưa đủ để commit. Vui lòng kiểm tra lại thông tin.',
      };
    }

    const booking: BookingDto = parsed.data;
    const dedupeKey = this.makeDedupeKey(booking, prov.idempotencyKey);
    if (this.committedKeys.has(dedupeKey)) {
      // already committed
      this.provisional.delete(provisionalId);
      return { success: true, message: 'Booking đã được lưu trước đó.' };
    }

    try {
      await this.sheets.createBooking(booking);
      this.committedKeys.add(dedupeKey);
      this.provisional.delete(provisionalId);
      return { success: true, message: 'Đã lưu booking thành công.' };
    } catch (err) {
      this.logger.error('commitProvisional -> sheets error', err);
      return { success: false, message: 'Lưu booking thất bại, thử lại sau.' };
    }
  }

  /** --- Helper functions --- */

  // create a deterministic dedupe key from booking or use idempotencyKey
  private makeDedupeKey(
    booking: PartialBooking | BookingDto,
    idempotencyKey?: string | null,
  ): string {
    if (idempotencyKey) return `idem:${idempotencyKey}`;
    // prefer phone + checkin + roomType as composite key
    const phone = String((booking as any).phone || '').trim();
    const checkin = String((booking as any).checkin || '').trim();
    const roomType = String((booking as any).roomType || '').trim();
    if (phone) return `phone:${phone}|ci:${checkin}|rt:${roomType}`;
    // fallback to uuid
    return `tmp:${uuidv4()}`;
  }

  // save provisional record
  // eslint-disable-next-line @typescript-eslint/require-await
  private async saveProvisional(input: {
    sessionId?: string | null;
    booking: PartialBooking;
    idempotencyKey?: string | null;
  }): Promise<ProvisionalRecord> {
    const id = uuidv4();
    const now = Date.now();
    const rec: ProvisionalRecord = {
      id,
      sessionId: input.sessionId || null,
      booking: input.booking || {},
      createdAt: now,
      expiresAt: now + this.TTL,
      idempotencyKey: input.idempotencyKey || null,
    };
    this.provisional.set(id, rec);
    this.logger.log(
      `Saved provisional booking id=${id} (expires ${new Date(rec.expiresAt).toISOString()})`,
    );
    return rec;
  }

  // remove provisional by idempotency key (or matching booking phone+checkin)
  private removeProvisionalByIdempotencyKey(
    idempotencyKey?: string | null,
    booking?: PartialBooking | BookingDto,
  ) {
    if (!this.provisional.size) return;
    for (const [id, rec] of this.provisional.entries()) {
      if (idempotencyKey && rec.idempotencyKey === idempotencyKey) {
        this.provisional.delete(id);
        this.logger.debug(`Removed provisional ${id} by idempotencyKey`);
        continue;
      }
      // if idempotencyKey not present try match phone+checkin
      const recPhone = String(rec.booking?.phone || '').trim();
      const recCheckin = String(rec.booking?.checkin || '').trim();
      const bookingPhone = String((booking as any)?.phone || '').trim();
      const bookingCheckin = String((booking as any)?.checkin || '').trim();

      if (
        booking &&
        bookingPhone &&
        recPhone &&
        recPhone === bookingPhone &&
        recCheckin === bookingCheckin
      ) {
        this.provisional.delete(id);
        this.logger.debug(`Removed provisional ${id} by phone+checkin match`);
      }
    }
  }

  // Normalize partial booking (best-effort)
  private normalizePartialBooking(raw: any): PartialBooking {
    const normalized: PartialBooking = { ...raw };
    if (raw?.nights) normalized.nights = Number(raw.nights);
    if (raw?.guests) normalized.guests = Number(raw.guests);
    // trim strings
    [
      'name',
      'phone',
      'email',
      'checkin',
      'checkout',
      'roomType',
      'note',
      'status',
    ].forEach((k) => {
      if ((normalized as any)[k])
        (normalized as any)[k] = String((normalized as any)[k]).trim();
    });
    return normalized;
  }

  // Remove expired provisional records
  private cleanupExpired() {
    const now = Date.now();
    const toRemove: string[] = [];
    for (const [id, rec] of this.provisional.entries()) {
      if (rec.expiresAt <= now) toRemove.push(id);
    }
    toRemove.forEach((id) => {
      this.provisional.delete(id);
      this.logger.debug(`Provisional ${id} expired and removed`);
    });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { HotelGeminiService } from './hotel-gemini.service';
import { SheetsService } from './sheets.service';
import { BookingSchema, PartialBooking } from './dto/booking.dto';
import { parseAiJson } from 'src/shared/utils/parseAiJson';

type ProvisionalRecord = {
  sessionId: string;
  booking: PartialBooking;
  createdAt: number;
  expiresAt: number;
  idempotencyKey?: string;
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private provisional = new Map<string, ProvisionalRecord>();
  private committed = new Set<string>();
  private readonly TTL = 15 * 60 * 1000;

  constructor(
    private readonly gemini: HotelGeminiService,
    private readonly sheets: SheetsService,
  ) {}

  /** handle incoming chat message */
  async handleMessage(
    message: string,
    chatHistory: any[],
  ): Promise<{
    success: boolean;
    reply: string;
  }> {
    try {
      // 🔹 Chat AI
      const aiReply = await this.gemini.chatHotel(message, chatHistory);
      console.log('AI reply:', aiReply);
      // 🔹 Validate Booking Info
      const result = await BookingSchema.safeParseAsync(aiReply.customerInfo);

      if (result.success) {
        await this.sheets.createBooking(result.data);
      } else {
        console.warn(
          'Booking data không hợp lệ (chưa đủ thông tin):',
          result.error.format(),
        );
        // 👉 có thể tạm lưu vào DB/session để đợi khách bổ sung
      }

      return {
        success: true,
        reply: aiReply.message,
      };
    } catch (error) {
      console.error('handleMessage error:', error);

      return {
        success: false,
        reply:
          'Xin lỗi anh/chị, hệ thống đang gặp sự cố. Anh/chị vui lòng thử lại sau ạ.',
      };
    }
  }

  // /** confirm booking: only sessionId required */
  // async confirmBooking(sessionId: string) {
  //   const rec = this.provisional.get(sessionId);
  //   if (!rec)
  //     return {
  //       success: false,
  //       message: 'Booking không tồn tại hoặc đã hết hạn.',
  //     };
  //   if (Date.now() > rec.expiresAt) {
  //     this.provisional.delete(sessionId);
  //     return { success: false, message: 'Booking đã hết hạn.' };
  //   }

  //   const parseResult = BookingSchema.safeParse(rec.booking);
  //   if (!parseResult.success) {
  //     return {
  //       success: false,
  //       message:
  //         'Dữ liệu đặt phòng không hợp lệ: ' +
  //         JSON.stringify(parseResult.error.flatten()),
  //     };
  //   }

  //   const booking = parseResult.data;

  //   // tránh duplicate commit
  //   if (rec.idempotencyKey && this.committed.has(rec.idempotencyKey)) {
  //     this.provisional.delete(sessionId);
  //     return { success: true, message: 'Booking đã được ghi trước đó.' };
  //   }

  //   // check availability
  //   try {
  //     const roomStatus = await this.sheets.getRoomStatus(booking.checkin);
  //     if (roomStatus?.success) {
  //       const room = roomStatus.data.find(
  //         (r) =>
  //           r['Loại phòng'] === booking.room || r['Mã phòng'] === booking.room,
  //       );
  //       if (
  //         room &&
  //         room['Tình_trạng'] &&
  //         /hết|0|no/i.test(String(room['Tình_trạng']))
  //       ) {
  //         return {
  //           success: false,
  //           message: `Phòng ${booking.room} đã hết vào ngày ${booking.checkin}.`,
  //         };
  //       }
  //     }
  //   } catch (err) {
  //     this.logger.warn(
  //       'Không lấy được tình trạng phòng, tiếp tục thử ghi booking: ' +
  //         err?.message,
  //     );
  //   }

  //   // commit to Sheets
  //   const MAX_RETRY = 3;
  //   for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
  //     try {
  //       const res = await this.sheets.createBooking(booking);
  //       if (res?.success) {
  //         if (rec.idempotencyKey) this.committed.add(rec.idempotencyKey);
  //         this.provisional.delete(sessionId);
  //         return { success: true, message: 'Đặt phòng thành công!' };
  //       }
  //     } catch {
  //       await this.delay(500 * attempt);
  //     }
  //   }

  //   return {
  //     success: false,
  //     message: 'Không thể lưu booking vào Google Sheets.',
  //   };
  // }

  // // ----------------- helpers -----------------
  // private mergeWithFallback(
  //   sessionId: string,
  //   parsed: PartialBooking,
  //   rawText: string,
  // ): PartialBooking {
  //   const buf: PartialBooking = {
  //     ...(this.provisional.get(sessionId)?.booking || {}),
  //     ...(parsed || {}),
  //   };
  //   // extract phone
  //   if (!buf.phone) {
  //     const p = rawText.match(/0\d{9,10}|\+84\d{9,10}/)?.[0];
  //     if (p) buf.phone = p;
  //   }
  //   // extract email
  //   if (!buf.email) {
  //     const e = rawText.match(
  //       /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  //     )?.[0];
  //     if (e) buf.email = e;
  //   }
  //   // dates
  //   if (!buf.checkin || !buf.checkout) {
  //     const ds = rawText.match(/\d{4}-\d{2}-\d{2}/g);
  //     if (ds && ds.length >= 2) {
  //       buf.checkin = buf.checkin || ds[0];
  //       buf.checkout = buf.checkout || ds[1];
  //     }
  //   }
  //   // guests
  //   if (buf.guests === undefined) {
  //     const g = rawText.match(/(\d+)\s*(người|khách)/i)?.[1];
  //     if (g) buf.guests = parseInt(g, 10);
  //   }
  //   // room
  //   if (!buf.room) {
  //     const r = rawText.match(
  //       /\b(Deluxe|Suite|Superior|Standard|Family)\b/i,
  //     )?.[0];
  //     if (r) buf.room = r;
  //   }
  //   // name
  //   if (!buf.name) {
  //     const nameMatch = rawText.match(/^[\p{L}\s'.-]{3,60}(?=,|\d|@)/u);
  //     if (nameMatch) buf.name = nameMatch[0].trim();
  //     else {
  //       const nm = rawText.match(
  //         /(?:Họ tên|Tên|Name)[:\\-]\s*([A-Za-zÀ-ỹ\s]+)/i,
  //       );
  //       if (nm) buf.name = nm[1].trim();
  //     }
  //   }
  //   return buf;
  // }

  // private isComplete(b: PartialBooking): b is BookingDto {
  //   return !!(
  //     b.name &&
  //     b.phone &&
  //     b.email &&
  //     b.room &&
  //     b.checkin &&
  //     b.checkout &&
  //     typeof b.guests === 'number'
  //   );
  // }

  // /** build summary message để user xác nhận */
  // private buildBookingSummary(b: PartialBooking) {
  //   const name = b.name || '-';
  //   const phone = b.phone || '-';
  //   const email = b.email || '-';
  //   const room = b.room || '-';
  //   const checkin = b.checkin || '-';
  //   const checkout = b.checkout || '-';
  //   const guests = (b.guests ?? '-') as number | string;
  //   return `Xác nhận đặt phòng: ${room} từ ${checkin} đến ${checkout} cho ${guests} khách. Tên: ${name}, SĐT: ${phone}, Email: ${email}. Vui lòng kiểm tra và bấm "Đồng ý" nếu thông tin đúng.`;
  // }

  // private computeIdempotencyKey(b: BookingDto) {
  //   const raw = `${b.phone}|${b.room}|${b.checkin}|${b.checkout}`;
  //   return crypto.createHash('sha256').update(raw).digest('hex');
  // }

  // private delay(ms: number) {
  //   return new Promise((res) => setTimeout(res, ms));
  // }
}

import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini-formatter.service';
import { SheetsService } from './sheets.service';
import { Injectable } from '@nestjs/common';

// Types bổ sung
type ChatHistoryItem = { role: 'user' | 'assistant'; content: string };

type BookingIntent = {
  score: number;
  category: 'low' | 'medium' | 'high';
  reasons: string[];
  recommendedAction: string;
};

type BookingDto = {
  name: string | null;
  phone: string | null; // normalized E.164-like: +84xxxxxxxx
  email: string | null;
  checkin: string | null; // ISO string or raw date string
  checkout: string | null;
  roomType: string | null;
  nights: number | null;
  guests: number | null;
  note: string | null;
  status: string | null; // helpful status (e.g., "ok" or "invalid_phone")
  bookingIntent?: BookingIntent | null;
};

@Injectable()
export class HotelGeminiService {
  constructor(
    private readonly config: ConfigService,
    private readonly geminiService: GeminiService,
    private readonly sheetsService: SheetsService,
  ) {}
  // Hộp công cụ helper: validate tên
  private isValidName(name?: string | null): boolean {
    if (!name) return false;
    const trimmed = name.trim();
    if (trimmed.length < 5 || trimmed.length > 50) return false;
    // ít nhất 2 từ
    const words = trimmed.split(/\s+/);
    if (words.length < 2) return false;
    // Không chứa số hoặc ký tự đặc biệt (chỉ chữ và khoảng trắng và dấu -')
    // Cho phép các chữ unicode (tên Việt Nam có dấu)
    if (/[\d~`!@#$%^&*()_=+[\]{}\\|;:"<>/?]/.test(trimmed)) return false;
    return true;
  }

  // Normalize and validate VN phone -> return +84xxxxxxxx or null
  private normalizePhone(raw?: string | null): string | null {
    if (!raw) return null;
    let s = raw.trim();
    // remove spaces, dashes, parentheses
    s = s.replace(/[\s\-().]/g, '');
    // allow leading +, capture digits
    const hadPlus = s.startsWith('+');
    const digitsOnly = s.replace(/^\+/, '').replace(/\D/g, '');
    if (!digitsOnly) return null;
    // if starts with 84 or 0 treat accordingly
    let body = digitsOnly;
    if (hadPlus && digitsOnly.startsWith('84')) {
      body = digitsOnly.slice(2);
    } else if (digitsOnly.startsWith('0')) {
      body = digitsOnly.slice(1);
    } else if (
      digitsOnly.length > 8 &&
      digitsOnly.length <= 12 &&
      !digitsOnly.startsWith('0') &&
      !digitsOnly.startsWith('84')
    ) {
      // maybe already without prefix; accept as is
      body = digitsOnly;
    }

    // after stripping prefix, length should be 9-11 as spec
    if (body.length < 9 || body.length > 11) return null;

    // reject repeating sequences like 000000000 or 111111111
    if (/^([0-9])\1+$/.test(body)) return null;

    // final E.164 style
    return `+84${body}`;
  }

  // Basic email validation
  private isValidEmail(email?: string | null): boolean {
    if (!email) return false;
    const s = email.trim();
    // simple RFC-lite regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  }

  // Fallback deterministic evaluator for bookingIntent if AI didn't provide it
  private evaluateBookingIntentFallback(
    lastMessage: string,
    chatHistory: ChatHistoryItem[],
    customerInfo: BookingDto,
  ): BookingIntent {
    let score = 0;
    const reasons: string[] = [];

    const msg =
      (lastMessage || '') + ' ' + chatHistory.map((c) => c.content).join(' ');
    const confirmRe =
      /\b(đặt|giữ|xác nhận|muốn đặt|book|đặt ngay|đặt trước)\b/i;
    const priceRe = /\b(giá|bao nhiêu|phí|ưu đãi|km|khuyến mãi|voucher)\b/i;
    const dateRe =
      /\b(\d{1,2}\/\d{1,2}\/\d{2,4}|ngày|hôm nay|ngày mai|tháng)\b/i;
    const urgencyRe = /\b(gấp|ngay|khẩn|sớm|hôm nay|ngày mai)\b/i;
    const negRe = /\b(chỉ hỏi|tham khảo|chưa quyết định|so sánh|xem trước)\b/i;

    // contactProvided
    if (
      (customerInfo.phone && customerInfo.phone.length) ||
      (customerInfo.email && customerInfo.email.length)
    ) {
      score += 30;
      if (customerInfo.phone) reasons.push('Đã cung cấp số điện thoại');
      if (customerInfo.email) reasons.push('Đã cung cấp email');
    }

    // dateProvided
    if (customerInfo.checkin || customerInfo.checkout) {
      score += 20;
      reasons.push('Có ngày nhận/trả cụ thể');
    } else if (dateRe.test(msg)) {
      score += 12;
      reasons.push('Khách đề cập ngày/khoảng thời gian');
    }

    // nights/guests
    if (typeof customerInfo.nights === 'number' && customerInfo.nights > 0) {
      score += 10;
      reasons.push('Có số đêm rõ');
    }
    if (typeof customerInfo.guests === 'number' && customerInfo.guests > 0) {
      score += 8;
      reasons.push('Có số khách rõ');
    }

    // price question
    if (priceRe.test(msg)) {
      score += 10;
      reasons.push('Khách hỏi về giá/ưu đãi');
    }

    // explicit booking phrase
    if (confirmRe.test(msg)) {
      score += 25;
      reasons.push('Khách dùng từ thể hiện muốn đặt/giữ phòng');
    }

    // urgency
    if (urgencyRe.test(msg)) {
      score += 10;
      reasons.push('Có dấu hiệu cần gấp');
    }

    // repeated questions heuristic
    const questionCount =
      (chatHistory.map((c) => c.content).join(' ') + lastMessage).split('?')
        .length - 1;
    if (questionCount >= 2) {
      score += 8;
      reasons.push('Khách hỏi nhiều lần/so sánh');
    }

    // negative signals
    if (negRe.test(msg)) {
      score -= 15;
      reasons.push('Khách có dấu hiệu chỉ tham khảo/chưa quyết định');
    }

    if (score > 100) score = 100;
    if (score < 0) score = 0;

    let category: BookingIntent['category'] = 'low';
    let recommendedAction = 'add_to_nurture_campaign';
    if (score >= 75) {
      category = 'high';
      recommendedAction = 'call_within_30min';
    } else if (score >= 50) {
      category = 'medium';
      recommendedAction = 'send_email_offer';
    }

    return {
      score,
      category,
      reasons,
      recommendedAction,
    };
  }

  // Helper extract JSON from AI raw text robustly
  private tryExtractJson(raw: string): string | null {
    if (!raw) return null;
    // try direct parse first
    raw = raw.trim();
    try {
      JSON.parse(raw);
      return raw;
    } catch {
      /* continue */
    }

    // find the first { and last } and try substring (simple heuristic)
    const first = raw.indexOf('{');
    const last = raw.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      const cand = raw.slice(first, last + 1);
      try {
        JSON.parse(cand);
        return cand;
      } catch {
        // try to remove code fences ```json ... ```
        const cleaned = cand.replace(/```json|```/gi, '').trim();
        try {
          JSON.parse(cleaned);
          return cleaned;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  // Hàm chính - copy/replace vào service của bạn
  async chatHotel(
    message: string,
    chatHistory: ChatHistoryItem[],
  ): Promise<{ message: string; customerInfo: BookingDto }> {
    // 🔹 Lấy dữ liệu khách sạn
    const hotelRes = await this.sheetsService.getHotel();
    const roomsRes = await this.sheetsService.getRooms();
    const servicesRes = await this.sheetsService.getServices();

    if (!hotelRes.success || !roomsRes.success) {
      throw new Error('Không thể tải dữ liệu khách sạn');
    }

    const hotel = {
      name: hotelRes.data['Tên khách sạn'],
      address: hotelRes.data['Địa chỉ'],
      phone: hotelRes.data['Điện thoại'],
      email: hotelRes.data['Email'],
      checkIn: hotelRes.data['Giờ nhận phòng'],
      checkOut: hotelRes.data['Giờ trả phòng'],
      description:
        servicesRes.success && servicesRes.data.length
          ? servicesRes.data.map((s) => s['Dịch vụ']).join(', ')
          : 'Khách sạn cung cấp nhiều dịch vụ tiện ích.',
      rooms: roomsRes.data.map((r) => ({
        id: r['Mã phòng'],
        type: r['Loại phòng'],
        beds: r['Mô tả'],
        price: r['Giá'] ?? '-',
      })),
      policies: [
        'Hủy miễn phí 48 giờ trước khi nhận phòng.',
        'Không hút thuốc trong phòng.',
        'Thú cưng không được phép.',
      ],
    };

    // System prompt + validatePrompt (đã tinh gọn nhưng đủ rule)
    const systemPrompt = `
Bạn là lễ tân khách sạn ${hotel.name} ở Đà Nẵng.
Trả lời tự nhiên, thân thiện, tối đa 3 câu; xưng "em", gọi khách là "anh/chị".
Thông tin khách sạn: ${hotel.address}, ${hotel.phone}, ${hotel.email}.
Phòng & giá:
${hotel.rooms.map((r) => `- ${r.type}: ${r.price}, ${r.beds}`).join('\n')}
Dịch vụ: ${hotel.description}
Chính sách: ${hotel.policies.join('; ')}
`.trim();

    const validatePrompt = `
⚠️ Quy tắc bắt buộc (AI CHỈ TRẢ VỀ 1 KHỐI JSON, KHÔNG GHI THÊM VĂN BẢN):
- Trả về JSON với cấu trúc:
{
  "message": string,
  "customerInfo": {
    "name": string | null,
    "phone": string | null,
    "email": string | null,
    "checkin": string | null,
    "checkout": string | null,
    "roomType": string | null,
    "nights": number | null,
    "guests": number | null,
    "note": string | null,
    "status": string | null
  },
  "bookingIntent": {
    "score": number, // 0-100
    "category": "low"|"medium"|"high",
    "reasons": string[],
    "recommendedAction": string
  }
}

- Rules:
  * message: thân thiện, ngắn gọn (<=3 câu), xưng "em", hỏi gợi mở nếu thiếu thông tin.
  * Khi xin phone/email kèm text consent: "Anh/chị cho em xin email để em gửi xác nhận & ưu đãi nhanh nhé — thông tin chỉ dùng để xác nhận đặt phòng và chăm sóc, không chia sẻ bên thứ ba."
  * Nếu lịch đặt/nhận phòng không rõ, để checkin/checkout là null.
  * bookingIntent: AI phải tự tính điểm theo weights:
    - contactProvided: +30 (phone/email)
    - dateProvided: +20
    - nightsOrGuests: +10
    - priceOrRateQuestion: +10
    - explicitBookingPhrase: +25
    - urgencyWord: +10
    - repeatedQuestions: +8
    - negativeSignal: -15
  * Clamp score 0..100. Map score -> category: >=75 high; 50..74 medium; <50 low.
  * bookingIntent.reasons: list các lý do ngắn (tiếng Việt) dẫn tới điểm.
  * recommendedAction: chọn 1 trong: call_within_30min, sms_immediate, send_email_offer, assign_to_agent, remind_after_24h, add_to_nurture_campaign
- KHÔNG IN THÊM GÌ NGOÀI JSON.
`.trim();

    // Build chat for AI
    const messagesText = chatHistory
      .map((m) => `${m.role === 'user' ? 'Khách' : 'Lễ tân'}: ${m.content}`)
      .join('\n');

    const finalPrompt = `
${systemPrompt}

${validatePrompt}

💬 Lịch sử chat:
${messagesText}

💬 Khách vừa hỏi: ${message}
`.trim();

    // Gọi Gemini (hoặc service AI tương tự)
    const rawReply = await this.geminiService.chatWithGeminiRaw(finalPrompt);

    // Tách JSON từ raw reply robust
    const jsonText = this.tryExtractJson(rawReply);
    if (!jsonText) {
      throw new Error(`AI không trả về JSON hợp lệ. Raw: ${rawReply}`);
    }

    let parsedRaw: any;
    try {
      parsedRaw = JSON.parse(jsonText);
    } catch (err) {
      throw new Error(`Không thể parse JSON từ AI: ${err}`);
    }

    // Chuẩn hoá customerInfo vào BookingDto
    const ci = parsedRaw.customerInfo || {};
    const bookingIntentFromAI = parsedRaw.bookingIntent || null;

    const booking: BookingDto = {
      name: ci.name ? String(ci.name).trim() : null,
      phone: ci.phone ? String(ci.phone).trim() : null,
      email: ci.email ? String(ci.email).trim() : null,
      checkin: ci.checkin ? String(ci.checkin).trim() : null,
      checkout: ci.checkout ? String(ci.checkout).trim() : null,
      roomType: ci.roomType ? String(ci.roomType).trim() : null,
      nights:
        typeof ci.nights === 'number'
          ? ci.nights
          : ci.nights
            ? Number(ci.nights)
            : null,
      guests:
        typeof ci.guests === 'number'
          ? ci.guests
          : ci.guests
            ? Number(ci.guests)
            : null,
      note: ci.note ? String(ci.note).trim() : null,
      status: 'ok',
      bookingIntent: null,
    };

    // Validate name & phone & email according to rules in prompt
    // Name
    if (booking.name && !this.isValidName(booking.name)) {
      // nếu tên không hợp lệ, bỏ tên và cập nhật status
      booking.status = 'invalid_name';
      booking.name = null;
    }

    // Phone
    const normalizedPhone = this.normalizePhone(booking.phone);
    if (booking.phone && !normalizedPhone) {
      booking.status =
        booking.status === 'ok'
          ? 'invalid_phone'
          : booking.status + ';invalid_phone';
      booking.phone = null;
    } else if (normalizedPhone) {
      booking.phone = normalizedPhone;
    }

    // Email
    if (booking.email && !this.isValidEmail(booking.email)) {
      booking.status =
        booking.status === 'ok'
          ? 'invalid_email'
          : booking.status + ';invalid_email';
      booking.email = null;
    }

    // If AI did not return bookingIntent, compute fallback
    if (!bookingIntentFromAI || typeof bookingIntentFromAI.score !== 'number') {
      booking.bookingIntent = this.evaluateBookingIntentFallback(
        message,
        chatHistory,
        booking,
      );
    } else {
      // Some minimal validation/clamp on AI-provided bookingIntent
      const bi = bookingIntentFromAI;
      const score = Number.isFinite(bi.score)
        ? Math.max(0, Math.min(100, Math.round(bi.score)))
        : 0;
      let category: BookingIntent['category'] = 'low';
      if (score >= 75) category = 'high';
      else if (score >= 50) category = 'medium';
      else category = 'low';

      const reasons = Array.isArray(bi.reasons) ? bi.reasons.map(String) : [];
      const recommendedAction =
        typeof bi.recommendedAction === 'string'
          ? bi.recommendedAction
          : category === 'high'
            ? 'call_within_30min'
            : category === 'medium'
              ? 'send_email_offer'
              : 'add_to_nurture_campaign';

      booking.bookingIntent = {
        score,
        category,
        reasons,
        recommendedAction,
      };
    }

    // Final safety: ensure message exists and is short
    let replyMessage =
      typeof parsedRaw.message === 'string' ? parsedRaw.message.trim() : '';
    if (!replyMessage) {
      // fallback message if AI omitted it
      replyMessage =
        'Dạ em nhận được ạ. Anh/chị cho em biết thêm ngày và số khách để em tư vấn chính xác hơn nhé.';
    }
    // enforce max ~3 sentences: truncate to first 3 sentences
    const sentences = replyMessage.split(/([.?!])\s+/).filter(Boolean);
    if (sentences.length > 6) {
      // crude: take first 6 tokens (approx 3 sentences)
      replyMessage = sentences.slice(0, 6).join(' ').trim();
    }

    // Trả về cho controller/UI
    return {
      message: replyMessage,
      customerInfo: booking,
    };
  }
}

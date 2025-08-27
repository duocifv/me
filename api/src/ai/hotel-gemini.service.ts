import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini-formatter.service';
import { SheetsService } from './sheets.service';
import { Injectable } from '@nestjs/common';
import { HotelData } from './type/hotel.type';

// Types bổ sung
type ChatHistoryItem = { role: 'user' | 'assistant'; content: string };

type BookingIntent = {
  score: number;
  category: 'Thấp' | 'Trung bình' | 'Cao' | 'Rất cao';
  reasons: string[];
  recommendedAction: string;
};
interface HotelCache {
  data: any;
  expires: number;
}
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
  private hotelCache: HotelCache | null = null;

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

    let category: BookingIntent['category'] = 'Thấp';
    let recommendedAction = 'Đưa vào danh sách chăm sóc dài hạn';

    if (score >= 75) {
      category = 'Rất cao';
      recommendedAction = 'Gọi ngay lập tức';
    } else if (score >= 50) {
      category = 'Cao';
      recommendedAction = 'Gọi lại trong 30 phút';
    } else if (score >= 25) {
      category = 'Trung bình';
      recommendedAction = 'Gửi email chào giá';
    }
    // score < 25 vẫn giữ: Thấp / Đưa vào danh sách chăm sóc dài hạn

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
    const hotel = await this.getHotelData();

    // System prompt + validatePrompt (đã tinh gọn nhưng đủ rule)
    const systemPrompt = `
Bạn là lễ tân khách sạn ${hotel.name} ở Đà Nẵng.
Trả lời tự nhiên, thân thiện, tối đa 3 câu; xưng "em", gọi khách là "anh/chị".
Thông tin khách sạn:
- Địa chỉ: ${hotel.address}
- Điện thoại: ${hotel.phone}
- Email: ${hotel.email}

Các loại phòng & giá:
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
    "checkin": string | null,   // phải ở dạng "YYYY-MM-DD" hoặc null
    "checkout": string | null,  // phải ở dạng "YYYY-MM-DD" hoặc null
    "roomType": string | null,
    "nights": number | null,
    "guests": number | null,
    "note": string | null,
    "status": string | null
  },
  "bookingIntent": {
    "score": number, // 0-100
    "category": "Thấp" | "Trung bình" | "Cao" | "Rất cao",
    "reasons": string[],
    "recommendedAction": string
  }
}

- Rules chính (tóm tắt):
  * message: thân thiện, ngắn gọn (<=3 câu), xưng "em", hỏi gợi mở nếu thiếu thông tin.
  * Khi xin phone/email, **chỉ hỏi nếu khách chưa cung cấp**:
    - Nếu message đã có số điện thoại, **không hỏi lại số điện thoại**.
    - Nếu message đã có email, **không hỏi lại email**.
    - Khi cần hỏi email, dùng câu ngắn gọn kèm consent: "Anh/chị cho em xin email để gửi xác nhận & ưu đãi, thông tin chỉ dùng để chăm sóc, không chia sẻ."
    - Email chỉ nhắc **1 lần duy nhất**; nếu khách sau đó cung cấp thì phản hồi: "Em đã ghi nhận email của anh/chị, sẽ gửi xác nhận và thông tin ưu đãi qua email sớm nhất ạ."
  * Nếu lịch nhận/trả phòng không rõ, để 'checkin'/'checkout' = null.

  - ⚠️ **Luật chuẩn hoá ngày (bắt buộc)**:
   1. **Luôn trả về** 'checkin và 'checkout' ở dạng **ISO date-only**: 'YYYY-MM-DD' (ví dụ '2024-08-27) hoặc **null** nếu không thể xác định. KHÔNG trả về datetime có thời gian (không có 'T...Z').
  2. **Các định dạng đầu vào AI có thể gặp** (không giới hạn):  
     - 'YYYY-MM-DD' (ví dụ '2024-08-27') → giữ nguyên.  
     - ISO full (ví dụ '2024-08-27T17:00:00.000Z') → chuyển về '2024-08-27' (theo timezone **Asia/Ho_Chi_Minh**).  
     - 'DD/MM/YYYY', 'DD-MM-YYYY', 'D/M/YY' (ví dụ '27/8/2024', '27-08-2024', '27/8/24') → chuyển về 'YYYY-MM-DD'.  
     - '27/8' hoặc '27-8' (không có năm) → **giả định năm hiện tại**; nếu ngày đó đã qua trong năm hiện tại thì tăng 1 năm (để ra ngày trong tương lai).  
     - Các dạng chữ: '27 tháng 8', '27 Aug 2024', 'Aug 27' → parse và chuyển về 'YYYY-MM-DD' theo quy tắc trên.  
     - Từ ngữ tương đối: 'hôm nay', 'ngày mai', 'cuối tuần này' → **giải mã thành ngày cụ thể** tương ứng theo timezone **Asia/Ho_Chi_Minh** và trả về 'YYYY-MM-DD'.  
  3. **Nếu không thể xác định chính xác ngày** (ví dụ: "cuối tuần" mà không rõ ngày, hoặc text quá mơ hồ), **gán null** cho 'checkin' hoặc 'checkout'. KHÔNG đoán linh tinh.  
  4. **Nếu AI chuyển đổi ngày, phải đảm bảo tính hợp lệ** (ví dụ checkin ≤ checkout nếu cả hai có giá trị; nếu không hợp lệ thì set checkout hoặc checkin = null và giải thích ngắn trong 'message' kèm câu gợi mở để khách cung cấp lại — nhưng nhớ vẫn chỉ trả JSON).
  5. **Ví dụ chuyển đổi (AI phải làm theo ví dụ)**:
     - Input: "27/8/2024" → output 'checkin': "2024-08-27"
     - Input: "2024-08-27T17:00:00.000Z" → output 'checkin': "2024-08-27"
     - Input: "ngày mai" (giả sử hôm nay 2025-08-26 Asia/Ho_Chi_Minh) → output 'checkin': "2025-08-27"
     - Input: "27/8" (năm hiện tại 2025) và 27/8/2025 đã qua → assume 2026-08-27
     - Input mơ hồ → 'checkin': null

- ⚠️ Quy tắc xử lý Họ và tên (BẮT BUỘC nếu khách muốn đặt):
  + Yêu cầu họ tên đầy đủ khi thiếu hoặc không hợp lệ.
  + Tiêu chuẩn hợp lệ:
    - Ít nhất 2 từ.
    - Không chứa chữ số hoặc ký tự đặc biệt (chỉ chữ unicode, dấu - và ' và khoảng trắng).
    - Độ dài 5..50 ký tự.
  + Nếu khách nhập họ tên **không hợp lệ**, AI phải **khéo léo nhắc** bằng câu:  
    "Anh/chị cho em xin họ và tên đầy đủ để em hoàn tất giữ phòng nhé."

- ⚠️ Quy tắc xử lý SĐT (BẮT BUỘC):
  + Yêu cầu SĐT hợp lệ khi thiếu hoặc không hợp lệ.
  + Tiêu chuẩn hợp lệ:
    - Định dạng VN: '0xxxxxxxxx' hoặc '+84xxxxxxxxx'.
    - Sau khi loại bỏ tiền tố ('+84' hoặc '0') còn 9–11 chữ số.
    - Chỉ chứa chữ số (có thể có dấu + ở đầu).
    - Không phải dãy lặp vô nghĩa (ví dụ '000000000', '111111111').
  + Nếu SĐT **không hợp lệ**, AI phải nhắc lịch sự:  
    "Anh/chị cho em xin số điện thoại hợp lệ để em xác nhận đặt phòng ạ."

- ⚠️ Quy tắc xử lý email:
  - Email là **tùy chọn**, chỉ nhắc 1 lần nếu chưa có.
  - Nếu khách đã cung cấp email trong message, AI phải trả lời thêm:  
    "Em đã ghi nhận email của anh/chị, sẽ gửi xác nhận và thông tin ưu đãi qua email sớm nhất ạ."
  - Nếu khách chưa cung cấp email, gợi ý bằng câu:  
    "Anh/chị có thể để lại email để nhận xác nhận nhanh và ưu đãi ạ."

- bookingIntent (tự động tính điểm):
  - Có cung cấp số điện thoại hoặc email: **+30**
  - Có cung cấp ngày nhận hoặc trả phòng: **+20**
  - Có thông tin số đêm hoặc số khách: **+10**
  - Có câu hỏi về giá/phòng/khuyến mãi: **+10**
  - Có cụm từ thể hiện ý định đặt phòng rõ ràng: **+25**
  - Có từ ngữ thể hiện tính khẩn cấp: **+10**
  - Có hỏi lặp lại nhiều lần: **+8**
  - Có tín hiệu không quan tâm / phủ định: **-15**
  * Clamp score trong 0..100.
  * Ánh xạ điểm sang mức độ (category):
    - 0–49 → "thấp"
    - 50–74 → "trung bình"
    - 75–100 → "cao"
    - (Bạn có thể dùng thêm "Rất cao" cho score >= 85 nếu muốn — nhưng giữ nhất quán)
 * bookingIntent.reasons: trả về danh sách ngắn gọn **tiếng Việt** (ví dụ: "Có thông tin liên hệ", "Có ngày lưu trú", "Có câu xác nhận đặt phòng", "Hỏi về giá", "Có dấu hiệu khẩn cấp", "Có hỏi lặp lại", "Tín hiệu không quan tâm")
* recommendedAction: chọn **1** trong các hành động (trả về tiếng Việt ngắn gọn hoặc mã nội bộ):
    - gọi điện trong 30 phút
    - gửi SMS ngay
    - gửi email xác nhận/ưu đãi
    - chuyển nhân viên xử lý
    - nhắc lại sau 24 giờ
    - thêm vào chiến dịch chăm sóc
- Khi thiếu thông tin liên quan đến đặt phòng (ví dụ: số đêm, số khách, loại phòng), gợi mở bằng câu thân thiện kiểu:
  "Anh/chị dự định ở mấy đêm và đi bao nhiêu người để em tư vấn phù hợp hơn ạ?"
  
- Luôn **ĐẢM BẢO**:
  * Không in thêm văn bản ngoài JSON.
  * Trường 'message vẫn là văn bản thân thiện để hiển thị cho khách (không vượt quá 3 câu).
  * Nếu yêu cầu xin thông tin, dùng các câu nhắc đã nêu ở trên (exact phrasing recommended).


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
    console.log('Raw AI reply:', rawReply);
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

    // Xử lý bookingIntent từ AI hoặc fallback
    if (!bookingIntentFromAI || !Array.isArray(bookingIntentFromAI.reasons)) {
      // Nếu AI không trả về hoặc không hợp lệ, dùng fallback
      booking.bookingIntent = this.evaluateBookingIntentFallback(
        message,
        chatHistory,
        booking,
      );
    } else {
      const bi = bookingIntentFromAI;

      // ✅ Danh sách lý do AI trả về (tiếng Việt)
      const reasons: string[] = bi.reasons.map(String);

      // ✅ Tính điểm dựa trên lý do
      let score = 0;
      if (reasons.includes('Có thông tin liên hệ')) score += 30;
      if (reasons.includes('Có ngày lưu trú')) score += 20;
      if (reasons.includes('Có thông tin số khách')) score += 10;
      if (reasons.includes('Hỏi về giá')) score += 10;
      if (reasons.includes('Có câu xác nhận đặt phòng')) score += 25;
      if (reasons.includes('Có dấu hiệu khẩn cấp')) score += 10;
      if (reasons.includes('Có hỏi lặp lại')) score += 8;
      if (reasons.includes('Tín hiệu không quan tâm')) score -= 15;

      // ✅ Clamp điểm 0..100
      score = Math.max(0, Math.min(100, Math.round(score)));

      // ✅ Phân loại 4 bậc
      let category: BookingIntent['category'];
      if (score >= 85) category = 'Rất cao';
      else if (score >= 75) category = 'Cao';
      else if (score >= 50) category = 'Trung bình';
      else category = 'Thấp';

      // ✅ Hành động đề xuất dựa trên category
      const recommendedAction =
        typeof bi.recommendedAction === 'string' &&
        bi.recommendedAction.trim() !== ''
          ? bi.recommendedAction
          : category === 'Rất cao'
            ? 'Gọi ngay lập tức'
            : category === 'Cao'
              ? 'Gọi lại trong 30 phút'
              : category === 'Trung bình'
                ? 'Gửi email chào giá'
                : 'Đưa vào danh sách chăm sóc dài hạn';

      // ✅ Gán vào booking
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

  private async getHotelData() {
    // TTL = 5 phút
    const TTL = 1000 * 60 * 60 * 2;
    if (this.hotelCache && this.hotelCache.expires > Date.now()) {
      return this.hotelCache.data as HotelData;
    }

    // 🔹 Fetch mới
    const hotelRes = await this.sheetsService.getHotel();
    const roomsRes = await this.sheetsService.getRooms();
    const servicesRes = await this.sheetsService.getServices();

    if (!hotelRes.success || !roomsRes.success) {
      throw new Error('Không thể tải dữ liệu khách sạn');
    }

    const data: HotelData = {
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

    // 🔹 Lưu vào cache
    this.hotelCache = { data, expires: Date.now() + TTL };
    return data;
  }
}

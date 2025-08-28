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
    customerInfo: Partial<BookingDto> | null = null,
  ): Promise<{
    message: string;
    customerInfo: BookingDto;
    shouldCommit: boolean;
  }> {
    console.log('customerInfo to AI:', customerInfo);

    // 🔹 Lấy dữ liệu khách sạn
    const hotel = await this.getHotelData();
    const customerInfoForPrompt = this.buildCustomerInfoForPrompt(customerInfo);

    // System prompt + validatePrompt (đã tinh gọn nhưng đủ rule)
    const systemPrompt = `
Bạn là lễ tân khách sạn ${hotel.name} (vai trò: lễ tân/CSKH có nhiều năm kinh nghiệm). 
Mục tiêu: TƯ VẤN thân thiện và THU THẬP thông tin quan trọng để hỗ trợ đặt phòng. 
Phong cách trả lời: thân thiện, ngắn gọn (tối đa 3 câu), xưng "em", gọi khách "anh/chị" và không lặp lại "anh/chị" quá nhiều trong 1 câu.
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
⚠️ QUY TẮC BẮT BUỘC (Model chỉ trả về 1 KHỐI JSON duy nhất — KHÔNG in thêm văn bản):
1) Luôn trả về EXACTLY 1 JSON theo schema:
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
    "bookingIntent": {
      "score": number, // 0-100
      "category": "Thấp" | "Trung bình" | "Cao" | "Rất cao",
      "reasons": string[],
      "recommendedAction": string
    }
  },
  "shouldCommit": boolean
}

2) **Ưu tiên thu thập (BẮT BUỘC)**:
- Nếu **name** thiếu/không hợp lệ → *PHẢI* hỏi ngay bằng exact phrase:
  "Anh/chị cho em xin họ và tên đầy đủ để em hoàn tất giữ phòng nhé."
  (Không hỏi bất kỳ thông tin khác trước khi thu được họ tên hợp lệ.)
- Nếu **phone** thiếu/không hợp lệ → *PHẢI* hỏi ngay bằng exact phrase:
  "Anh/chị cho em xin số điện thoại hợp lệ để em xác nhận đặt phòng ạ."
  (Không hỏi ngày/giá/khuyến mãi trước khi có số điện thoại hợp lệ.)
  --- QUY TẮC TUYỆT ĐỐI VỀ THỨ TỰ HỎI (BẮT BUỘC) ---

- Nếu **cả name và phone đều missing/invalid** trong "Thông tin hiện có":
  1. **PHẢI** hỏi NGAY *Họ và Tên* bằng exact phrase:
     "Anh/chị cho em xin họ và tên đầy đủ để em hoàn tất giữ phòng nhé."
  2. **KHÔNG** được hỏi số điện thoại trước khi đã có họ tên hợp lệ.
  3. **KHÔNG** được kèm gợi ý phòng/giá/ưu đãi trong cùng response hỏi tên. Response chỉ nên hỏi tên (1 câu ngắn), không hỏi thêm field khác.

- Nếu **name đã hợp lệ nhưng phone missing/invalid**:
  1. **PHẢI** hỏi NGAY *số điện thoại* bằng exact phrase:
     "Anh/chị cho em xin số điện thoại hợp lệ để em xác nhận đặt phòng ạ."
  2. Có thể thêm 1 câu very-short xác nhận tên trước khi hỏi phone (ví dụ: "Cảm ơn anh/chị Nguyễn Văn A."), nhưng vẫn **chỉ hỏi 1 field chính** (phone) trong response.

- Nếu **message** từ khách *đã chứa* một số điện thoại hợp lệ nhưng name missing:
  → Model coi phone là đã được cung cấp, nhưng **vẫn PHẢI** hỏi name ngay (ask name first).

- Mỗi response **ưu tiên chỉ 1 field bắt buộc** (theo thứ tự: name → phone). Không hỏi cùng lúc name + phone trừ khi khách vừa cung cấp một trong hai trong message trước đó.

- Nếu model vi phạm thứ tự (ví dụ: hỏi phone trước khi có name), server có quyền **override** response: thay bằng exact phrase hỏi *name* và giữ [customerInfo] không commit (server-side enforcement recommended).


3) **Email**: tùy chọn — chỉ hỏi **1 lần** nếu chưa có.
- Exact phrase để hỏi: "Anh/chị cho em xin email để gửi xác nhận & ưu đãi, thông tin chỉ dùng để chăm sóc, không chia sẻ."
- Nếu khách đã cung cấp email thì trả thêm câu: "Em đã ghi nhận email của anh/chị, sẽ gửi xác nhận và thông tin ưu đãi qua email sớm nhất ạ."
4) **Luật chuẩn hoá ngày (BẮT BUỘC)**:
- \`checkin\` và \`checkout\` phải là **ISO date-only**: "YYYY-MM-DD" theo timezone **Asia/Ho_Chi_Minh**, hoặc **null** nếu không thể xác định.
- Input có thể ở nhiều dạng; model phải parse/convert theo quy tắc:
  - 'YYYY-MM-DD' → giữ nguyên.
  - ISO full '2024-08-27T17:00:00.000Z' → chuyển về '2024-08-27' (theo Asia/Ho_Chi_Minh).
  - 'DD/MM/YYYY'/'DD-MM-YYYY'/'D/M/YY' → chuyển về 'YYYY-MM-DD'.
  - '27/8' hoặc '27-8' (không có năm) → giả định năm hiện tại; nếu ngày đó đã qua trong năm hiện tại thì tăng 1 năm.
  - '27 tháng 8', '27 Aug 2024', 'Aug 27' → parse và chuyển về 'YYYY-MM-DD'.
  - Từ ngữ tương đối: 'hôm nay', 'ngày mai', 'cuối tuần này' → giải mã thành ngày cụ thể theo Asia/Ho_Chi_Minh.
- Nếu **không thể xác định chính xác** → gán **null** cho checkin/checkout.
- Nếu cả hai ngày có giá trị phải đảm bảo **checkin ≤ checkout**; nếu không hợp lệ → set trường không thể xác định thành **null** và giải thích ngắn trong 'message' (nhưng vẫn CHỈ TRẢ JSON).

5) **Quy tắc xử lý Họ tên (BẮT BUỘC nếu khách muốn đặt)**:
- Yêu cầu họ tên đầy đủ khi thiếu/không hợp lệ.
- Tiêu chuẩn hợp lệ:
  - Ít nhất 2 từ.
  - Không chứa chữ số hoặc các ký tự đặc biệt (chỉ chữ Unicode, dấu - và ' và khoảng trắng).
  - Độ dài 5..50 ký tự.
- Nếu không hợp lệ, AI phải nhắc bằng exact phrase:
  "Anh/chị cho em xin họ và tên đầy đủ để em hoàn tất giữ phòng nhé."

6) **Quy tắc xử lý SĐT (BẮT BUỘC)**:
- Yêu cầu SĐT hợp lệ khi thiếu/không hợp lệ.
- Tiêu chuẩn hợp lệ:
  - VN: '0xxxxxxxxx' hoặc '+84xxxxxxxxx'.
  - Sau khi loại bỏ prefix (+84 hoặc 0) còn 9–11 chữ số.
  - Chỉ chứa chữ số (có thể có dấu '+' ở đầu).
  - Không phải dãy lặp vô nghĩa (ví dụ '000000000', '111111111').
- Nếu không hợp lệ, AI phải nhắc bằng exact phrase:
  "Anh/chị cho em xin số điện thoại hợp lệ để em xác nhận đặt phòng ạ."
7) **bookingIntent (tự động tính điểm)** — cộng/trừ điểm:
- Có số điện thoại hoặc email: **+30**
- Có ngày nhận hoặc trả phòng: **+20**
- Có số đêm hoặc số khách: **+10**
- Có hỏi về giá/phòng/khuyến mãi: **+10**
- Có cụm từ thể hiện ý định đặt phòng rõ ràng: **+25**
- Có chỉ rõ tính khẩn cấp: **+10**
- Hỏi lặp lại nhiều lần: **+8**
- Tín hiệu không quan tâm / phủ định: **-15**

*Clamp score 0..100.*

**Mapping category**:
- 0–49 → "Thấp"
- 50–74 → "Trung bình"
- 75–100 → "Cao"
- (Bạn có thể set "Rất cao" nếu score >=85 — nhưng giữ nhất quán.)

[bookingIntent.reasons] trả danh sách ngắn gọn tiếng Việt (ví dụ: "Có thông tin liên hệ", "Có ngày lưu trú", "Có câu xác nhận đặt phòng", "Hỏi về giá", "Có dấu hiệu khẩn cấp", "Có hỏi lặp lại", "Tín hiệu không quan tâm").

[recommendedAction] chọn 1 mục trong: "gọi điện trong 30 phút", "gửi SMS ngay", "gửi email xác nhận/ưu đãi", "chuyển nhân viên xử lý", "nhắc lại sau 24 giờ", "thêm vào chiến dịch chăm sóc".

8) **Message**: thân thiện, ≤3 câu; nếu yêu cầu thông tin thì dùng EXACT PHRASE nêu ở trên; KHÔNG hỏi nhiều thứ cùng lúc — ưu tiên name → phone.

9) **Đầu vào tham khảo**: trong prompt sẽ có "Thông tin hiện có của khách" (ví dụ { name: {value, hint}, phone: {value, hint} }). Thông tin đó *chỉ dùng để tham khảo*. Khi trả về JSON không kèm hint/metadata — chỉ trả 'customerInfo' thuần.

  
10) **Nếu model không thể tuân thủ**: trả fallback JSON lỗi:
{
  "message": "Xin lỗi, tôi không thể xử lý yêu cầu. Vui lòng thử lại sau.",
  "customerInfo": { "name": null, "phone": null, "email": null, "checkin": null, "checkout": null, "roomType": null, "nights": null, "guests": null, "note": null, "status": null },
  "bookingIntent": { "score": 0, "category": "Thấp", "reasons": [], "recommendedAction": "nhắc lại sau 24 giờ" }
}

11) **shouldCommit (flag do AI đánh giá)**:
- Giá trị = true khi và chỉ khi:
  - Đã có **name** và **phone** hợp lệ, VÀ
  - Khách thể hiện rõ ràng ý định xác nhận / đặt phòng (ví dụ: "ok đặt phòng", "giữ phòng cho tôi", "xác nhận", "đặt luôn").
- Trong mọi trường hợp khác (khách mới chỉ hỏi, còn thiếu name/phone, hoặc chưa confirm) → shouldCommit = false.
- Các field khác như checkin, checkout, roomType: nếu khách cung cấp thì ghi nhận; nếu chưa có vẫn có thể commit (miễn là name+phone đã hợp lệ và có confirm).

`.trim();

    const customerPrompt = `
--- THÔNG TIN HIỆN CÓ (CHỈ THAM KHẢO) ---
Dưới đây là các trường đã được chuẩn hoá và trạng thái (value/hint). 
**LƯU Ý QUAN TRỌNG:** Đây là CHỈ THAM KHẢO. Khi trả về, bạn PHẢI CHỈ TRẢ VỀ 1 KHỐI JSON theo schema đã nêu (không kèm hint/metadata, không lặp lại block này).
${JSON.stringify(customerInfoForPrompt, null, 2)}

**INSTRUCTION NGẮN DÀNH CHO MODEL (BẮT BUỘC)**:
- Sử dụng thông tin phía trên *chỉ* để quyết định hỏi/không hỏi.
- Không bao giờ bao gồm bất kỳ text mô tả, tag, hoặc metadata nào từ block trên trong trường 'customerInfo của JSON trả về.
- Nếu một trường trong block có hint: "missing" hoặc  hint: "invalid: ..." thì hãy *nhắc khách* bằng exact phrasing đã quy định (ví dụ: "Anh/chị cho em xin họ và tên đầy đủ để em hoàn tất giữ phòng nhé." hoặc "Anh/chị cho em xin số điện thoại hợp lệ để em xác nhận đặt phòng ạ.").
- Nếu mọi field đều ok, KHÔNG hỏi lại; chỉ trả lời xác nhận ngắn gọn.

`.trim();

    // Build chat for AI
    const messagesText = chatHistory
      .map((m) => `${m.role === 'user' ? 'Khách' : 'Lễ tân'}: ${m.content}`)
      .join('\n');

    const finalPrompt = `
${systemPrompt}

${validatePrompt}


${customerPrompt}

💬 Lịch sử chat:
${messagesText}


💬 Khách vừa hỏi: ${message}
`.trim();

    console.log('Final prompt to AI:', finalPrompt);
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
    const bookingIntentFromAI = parsedRaw.customerInfo.bookingIntent || null;

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
    // Xử lý bookingIntent từ AI hoặc fallback
    if (
      !bookingIntentFromAI ||
      typeof bookingIntentFromAI !== 'object' ||
      !Array.isArray(bookingIntentFromAI.reasons) ||
      typeof bookingIntentFromAI.score !== 'number' ||
      typeof bookingIntentFromAI.category !== 'string' ||
      typeof bookingIntentFromAI.recommendedAction !== 'string'
    ) {
      // fallback nếu AI không trả về JSON hợp lệ
      booking.bookingIntent = this.evaluateBookingIntentFallback(
        message,
        chatHistory,
        booking,
      );
    }
    // else {
    //   // gán trực tiếp AI output (tin tưởng đã qua lib xử lý)
    //   // chú ý: hàm check lại thông tin:  processBookingIntent();

    //   booking.bookingIntent = {
    //     score: bookingIntentFromAI.score,
    //     category: bookingIntentFromAI.category,
    //     reasons: bookingIntentFromAI.reasons.map(String),
    //     recommendedAction: bookingIntentFromAI.recommendedAction,
    //   };
    // }

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
      shouldCommit: parsedRaw.shouldCommit === true,
    };
  }

  private async getHotelData() {
    // TTL = 5 phút
    const TTL = 10000 * 60 * 60 * 2;
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

  // chỉ build 3 field: name, phone, email (omit email if not provided)
  private buildCustomerInfoForPrompt(ci: Partial<BookingDto> | null) {
    const out: Record<string, { value: string | null; hint: string | null }> =
      {};
    const src = ci || {};

    // name
    const rawName = (src as any).name;
    if (
      rawName === undefined ||
      rawName === null ||
      String(rawName).trim() === ''
    ) {
      out.name = { value: null, hint: 'missing' };
    } else {
      const v = String(rawName).trim();
      out.name = {
        value: v,
        hint: this.isValidName(v) ? 'ok' : 'invalid: tên không đúng định dạng',
      };
    }

    // phone
    const rawPhone = (src as any).phone;
    if (
      rawPhone === undefined ||
      rawPhone === null ||
      String(rawPhone).trim() === ''
    ) {
      out.phone = { value: null, hint: 'missing' };
    } else {
      const v = String(rawPhone).trim();
      const normalized = this.normalizePhone(v);
      out.phone = {
        value: normalized || v,
        hint: normalized ? 'ok' : 'invalid: số điện thoại không hợp lệ',
      };
    }

    // email: chỉ include khi khách đã cung cấp (không include nếu null/empty)
    const rawEmail = (src as any).email;
    if (
      rawEmail !== undefined &&
      rawEmail !== null &&
      String(rawEmail).trim() !== ''
    ) {
      const v = String(rawEmail).trim();
      out.email = {
        value: v,
        hint: this.isValidEmail(v) ? 'ok' : 'invalid: email không hợp lệ',
      };
    }

    return out;
  }
}

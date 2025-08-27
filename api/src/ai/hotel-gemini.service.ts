import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini-formatter.service';
import { SheetsService } from './sheets.service';
import { BookingDto, PartialBooking } from './dto/booking.dto';

@Injectable()
export class HotelGeminiService {
  constructor(
    private readonly config: ConfigService,
    private readonly geminiService: GeminiService,
    private readonly sheetsService: SheetsService,
  ) {}

  /** Chat bình thường với khách */
  async chatHotel(
    message: string,
    chatHistory: { role: 'user' | 'assistant'; content: string }[],
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

    const systemPrompt = `
Bạn là lễ tân khách sạn ${hotel.name} ở Đà Nẵng.
Trả lời tự nhiên, thân thiện, tối đa 3 câu.
Thông tin khách sạn: ${hotel.address}, ${hotel.phone}, ${hotel.email}.
Phòng & giá: ${hotel.rooms.map((r) => `- ${r.type}: ${r.price}, ${r.beds}`).join('\n')}
Dịch vụ: ${hotel.description}
Chính sách: ${hotel.policies.join('; ')}
`;

    const validatePrompt = `
⚠️ Quy tắc bắt buộc:
- Trả lời ngắn gọn, thân thiện (tối đa 3 câu), xưng "em", gọi khách là "anh/chị".
- Luôn trả lời dưới dạng JSON có 2 phần:
  {
    "message": "tin nhắn trả lời khách",
    "customerInfo": {
      name: string | null;
      phone: number | null;
      email: string | null;
      checkin: string | null; // ISO date string
      checkout: string | null; // ISO date string
      roomType: string | null;
      note: string | null;
      status: string | null;
    }
  }

📊 Đánh giá bookingIntent:
- "low" = khách chỉ hỏi chung.
- "medium" = khách hỏi giá, số đêm, số người.
- "high" = khách cung cấp liên hệ hoặc xác nhận muốn đặt.

📌 Quy tắc hội thoại:
- Nếu khách hỏi phòng/dịch vụ → gợi mở: 
  "Anh/chị dự định ở mấy đêm và đi bao nhiêu người để em tư vấn phù hợp hơn ạ?"

- Nếu khách quan tâm đặt phòng:

  ⚠️ Quy tắc xử lý Họ và tên:
  + BẮT BUỘC xin thêm: 
  • Họ và tên đầy đủ: 
      - Ít nhất 2 từ.  
      - Không chứa số hoặc ký tự đặc biệt.  
      - Không quá ngắn (< 5 ký tự) hoặc quá dài (> 50 ký tự). 
  + Nếu khách nhập sai Họ và tên → nhắc lịch sự: 
    "Anh/chị cho em xin họ và tên đầy đủ để em hoàn tất giữ phòng nhé."

  ⚠️ Quy tắc xử lý số điện thoại:
  + BẮT BUỘC xin thêm: 
  • SĐT hợp lệ: 
      - Định dạng Việt Nam: '0xxxxxxxxx hoặc '+84xxxxxxxxx.  
      - Độ dài hợp lệ 9–11 chữ số (sau khi bỏ tiền tố '+84 hoặc '0).  
      - Chỉ chứa số (có thể có dấu + ở đầu).  
      - Không phải dãy lặp vô nghĩa (vd: '0000000000, '1111111111). 
  + Nếu khách nhập SĐT sai → nhắc lịch sự: 
    "Anh/chị cho em xin số điện thoại hợp lệ để em xác nhận đặt phòng ạ."

  ⚠️ Quy tắc xử lý email:
  - Email là tùy chọn không bắt buộc, chỉ nhắc 1 lần duy nhất: 
  - Nếu khách đã để lại email: trả lời thêm "Em đã ghi nhận email của anh/chị, sẽ gửi xác nhận và thông tin ưu đãi qua email sớm nhất ạ."
  - Nếu khách chưa để lại email: gợi ý thêm "Anh/chị có thể để lại email để nhận xác nhận nhanh và ưu đãi ạ."


- Luôn tạo cảm giác khách có quyền chọn, không bị ép buộc.
`;

    const messagesText = chatHistory
      .map((m) => `${m.role === 'user' ? 'Khách' : 'Lễ tân'}: ${m.content}`)
      .join('\n');

    const finalPrompt = `
${systemPrompt}

${validatePrompt}

💬 Lịch sử chat:
${messagesText}

💬 Khách vừa hỏi: ${message}
`;

    const rawReply = await this.geminiService.chatWithGeminiRaw(finalPrompt);
    const cleaned = rawReply
      .replace(/```json/i, '')
      .replace(/```/g, '')
      .trim();
    let parsed: { message: string; customerInfo: BookingDto };

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(`AI trả về không phải JSON hợp lệ: ${rawReply}`);
    }

    return parsed;
  }

  /** Trích xuất thông tin booking từ tin nhắn khách (PartialBooking) */
  async parseBooking(
    message: string,
    chatHistory: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<PartialBooking> {
    try {
      const prompt = `
Bạn là lễ tân AI. Trích xuất thông tin booking từ nội dung dưới đây và trả về JSON:
Nội dung chat: ${chatHistory.map((h) => `${h.role}: ${h.content}`).join('\n')}
Khách vừa hỏi: ${message}

JSON chỉ gồm các trường: name, phone, email, room, checkin, checkout, guests
Nếu không có thông tin nào thì bỏ trống.
`;
      const raw = await this.geminiService.chatWithGeminiRaw(prompt);

      const cleaned = raw.replace(/```json|```/g, '').trim();
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start === -1 || end === -1) return {};
      const jsonStr = cleaned.slice(start, end + 1);
      return JSON.parse(jsonStr) as PartialBooking;
    } catch {
      return {};
    }
  }

  /** Tạo tóm tắt booking để user xác nhận trước khi commit */
  //   buildBookingSummary(booking: PartialBooking): string {
  //     const name = booking.name || '-';
  //     const phone = booking.phone || '-';
  //     const email = booking.email || '-';
  //     const room = booking.room || '-';
  //     const checkin = booking.checkin || '-';
  //     const checkout = booking.checkout || '-';
  //     const guests = booking.guests ?? '-';
  //     return `Xác nhận đặt phòng:
  // Phòng: ${room}
  // Từ: ${checkin} đến ${checkout}
  // Khách: ${guests}
  // Tên: ${name}, SĐT: ${phone}, Email: ${email}
  // Vui lòng kiểm tra và bấm "Đồng ý" nếu thông tin đúng.`;
  //   }
}

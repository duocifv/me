import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini-formatter.service';
import { SheetsService } from './sheets.service';
import { PartialBooking } from './dto/booking.dto';

@Injectable()
export class HotelGeminiService {
  constructor(
    private readonly config: ConfigService,
    private readonly geminiService: GeminiService,
    private readonly sheetsService: SheetsService,
  ) {}

  async chatHotel(
    message: string,
    chatHistory: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<string> {
    // 🔹 Lấy dữ liệu từ Google Sheets
    const hotelRes = await this.sheetsService.getHotel();
    const roomsRes = await this.sheetsService.getRooms();
    const servicesRes = await this.sheetsService.getServices();

    if (!hotelRes.success || !roomsRes.success) {
      throw new Error('Không thể tải dữ liệu khách sạn');
    }

    // 🔹 Map sang object chuẩn
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
        images: r['Hình ảnh'],
      })),
      policies: [
        'Hủy miễn phí 48 giờ trước khi nhận phòng.',
        'Không hút thuốc trong phòng.',
        'Thú cưng không được phép.',
      ],
    };

    // 🔹 Prompt
    const systemPrompt = `
Bạn là lễ tân khách sạn ${hotel.name}.
Cách giao tiếp: tự nhiên, thân thiện, như người thật, không cứng nhắc, giống như đang chat với bạn bè.

⚠️ Quy tắc:
- Trả lời NGẮN GỌN, tối đa 2 câu.
- Nếu khách quan tâm phòng/giá → bạn khéo léo thuyết phục họ đặt ngay.
- Nếu khách muốn đặt → hãy HỎI đủ thông tin: Họ tên, SĐT, Email, Loại phòng, Ngày check-in, Ngày check-out, Số khách.
- Không lưu booking trực tiếp, chỉ hỏi & xác nhận. Việc lưu sẽ do hệ thống gọi API.
- Không nhắc lại điện thoại/email khách sạn trừ khi họ yêu cầu.

🏨 Thông tin khách sạn:
- Địa chỉ: ${hotel.address}
- Điện thoại: ${hotel.phone}
- Email: ${hotel.email}
- Giờ nhận phòng: ${hotel.checkIn}, trả phòng: ${hotel.checkOut}
- Dịch vụ: ${hotel.description}

📌 Phòng & Giá:
${hotel.rooms.map((r) => `- ${r.type}: ${r.price}, ${r.beds}`).join('\n')}
📌 Chính sách:
${hotel.policies.map((p) => `- ${p}`).join('\n')}
`;

    // 🟢 Ghép lịch sử chat
    const messagesText = chatHistory
      .map((m) => `${m.role === 'user' ? 'Khách' : 'Lễ tân'}: ${m.content}`)
      .join('\n');

    const finalPrompt = `
${systemPrompt}

💬 Lịch sử chat:
${messagesText}

💬 Khách vừa hỏi: ${message}

⚠️ Trả lời NGẮN, tối đa 3 câu.
`;

    return this.geminiService.chatWithGeminiRaw(finalPrompt);
  }

  /** Parse thông tin booking từ tin nhắn khách */
  async parseBooking(
    message: string,
    chatHistory: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<PartialBooking> {
    try {
      // Tạo prompt để Gemini trả về JSON booking
      const prompt = `
Bạn là lễ tân AI. Trích xuất thông tin booking từ nội dung dưới đây và trả về JSON:
Nội dung chat: ${chatHistory.map((h) => `${h.role}: ${h.content}`).join('\n')}
Khách vừa hỏi: ${message}

JSON chỉ gồm các trường: name, phone, email, room, checkin, checkout, guests
Nếu không có thông tin nào thì bỏ trống.
`;
      const raw = await this.geminiService.chatWithGeminiRaw(prompt);

      // parse JSON trả về từ AI
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
}

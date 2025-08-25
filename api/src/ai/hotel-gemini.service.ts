import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini-formatter.service';

@Injectable()
export class HotelGeminiService {
  constructor(
    private readonly config: ConfigService,
    private readonly geminiService: GeminiService,
  ) {}

  /**
   * @param message câu hỏi mới
   * @param chatHistory mảng các tin nhắn client lưu ở localStorage
   * @param hotel optional thông tin khách sạn
   */
  async chatHotel(
    message: string,
    chatHistory: { role: 'user' | 'assistant'; content: string }[],
    hotel?: any,
  ): Promise<string> {
    const sampleHotel = hotel || {
      name: 'Mường Thanh Luxury Đà Nẵng Hotel',
      address: '270 Võ Nguyên Giáp, Mỹ An, Ngũ Hành Sơn, Đà Nẵng',
      phone: '+84 236 3956 789',
      email: 'info@muongthanhdanang.vn',
      checkIn: '14:00',
      checkOut: '12:00',
      description:
        'Khách sạn 4 sao ven biển với nhà hàng, spa, hồ bơi, phòng hội nghị và dịch vụ đưa đón sân bay.',
      rooms: [
        { type: 'Superior', price: '1.200.000đ/đêm' },
        { type: 'Deluxe', price: '1.500.000đ/đêm' },
        { type: 'Suite', price: '2.600.000đ/đêm' },
      ],
      policies: [
        'Hủy miễn phí 48 giờ trước khi nhận phòng.',
        'Không hút thuốc trong phòng.',
        'Thú cưng không được phép.',
      ],
    };

    // 🔹 Prompt mới: ngắn gọn, tự nhiên, tập trung hỗ trợ đặt phòng
    const systemPrompt = `
Bạn là lễ tân khách sạn ${sampleHotel.name}.
Cách giao tiếp: tự nhiên, thân thiện, như người thật. 
Mục tiêu: trả lời đúng trọng tâm câu hỏi khách, không nói dư. 
Luôn gợi mở thông tin đặt phòng (loại phòng, giá, liên hệ).
Ngôn ngữ: tiếng Việt, giọng lễ tân chuyên nghiệp.

🏨 Thông tin khách sạn:
- Địa chỉ: ${sampleHotel.address}
- Điện thoại: ${sampleHotel.phone}
- Email: ${sampleHotel.email}
- Giờ nhận phòng: ${sampleHotel.checkIn}, trả phòng: ${sampleHotel.checkOut}
- Dịch vụ: ${sampleHotel.description}

📌 Phòng & Giá:
${sampleHotel.rooms.map((r) => `- ${r.type}: ${r.price}`).join('\n')}

📌 Chính sách:
${sampleHotel.policies.map((p) => `- ${p}`).join('\n')}
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
`;

    return this.geminiService.chatWithGeminiRaw(finalPrompt);
  }
}

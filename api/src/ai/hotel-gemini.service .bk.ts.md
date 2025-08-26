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
      images: [
        'https://booking.muongthanh.com/images/service/2022/07/original/hotelservice19_1659000240.jpg',
        'https://booking.muongthanh.com/images/service/2022/07/original/ms_1658199195_1658999474.jpg',
        'https://booking.muongthanh.com/images/service/2022/07/original/be-boi_1658999681.jpg',
        'https://booking.muongthanh.com/images/service/2022/07/original/kara_1658199155_1658999543.jpg',
      ],
      rooms: [
        {
          id: 'r1',
          type: 'Superior',
          beds: '1 King',
          price: 120,
          images:
            'https://booking.muongthanh.com/images/rooms/hls/original/sm_large_grand_suite__4__1553048377.jpg',
        },
        {
          id: 'r2',
          type: 'Deluxe',
          beds: '2 Single',
          price: 150,
          images:
            'https://booking.muongthanh.com/images/rooms/hls/original/sm_large_deluxe_king_1553047078.jpg',
        },
        {
          id: 'r3',
          type: 'Suite',
          beds: '1 King + Living',
          price: 260,
          images:
            'https://booking.muongthanh.com/images/rooms/hls/original/sm_large_mt_luxyry___anang__2_of_178__-_resize_1559794115.jpg',
        },
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

⚠️ Quy tắc bắt buộc:
- Trả lời NGẮN GỌN, tối đa 2 câu, không giải thích dài.
- Ưu tiên trả lời đúng trọng tâm câu hỏi.
- Chỉ gợi ý đặt phòng khi khách quan tâm.
- Không lặp lại số điện thoại/email trừ khi khách yêu cầu.

🏨 Thông tin khách sạn:
- Địa chỉ: ${sampleHotel.address}
- Điện thoại: ${sampleHotel.phone}
- Email: ${sampleHotel.email}
- Giờ nhận phòng: ${sampleHotel.checkIn}, trả phòng: ${sampleHotel.checkOut}
- Dịch vụ: ${sampleHotel.description}

📌 Phòng & Giá:
${sampleHotel.rooms
  .map((r) => `- ${r.type}: ${r.price} USD/đêm, Ảnh: ${r.images}`)
  .join('\n')}
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

⚠️ Trả lời NGẮN, tối đa 2 câu. 
`;

    return this.geminiService.chatWithGeminiRaw(finalPrompt);
  }
}

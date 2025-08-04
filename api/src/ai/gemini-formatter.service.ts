// src/ai/gemini-formatter.service.ts
import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ScheduleAIDataDto } from './dto/ai.dto';

@Injectable()
export class GeminiService {
  constructor(private readonly config: ConfigService) {}

  async chatWithGeminiApi(prompt: string) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('⚠️ Thiếu GEMINI_API_KEY trong biến môi trường!');
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
    };

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    try {
      const res = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        body,
        { headers },
      );

      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const data = this.extractJson(text);

      return data;
    } catch (err) {
      throw new HttpException('Gemini API Error: ' + err.message, 500);
    }
  }

  async convertGeminiToSchedule(
    analysisText: string,
  ): Promise<ScheduleAIDataDto> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('⚠️ Thiếu GEMINI_API_KEY');

    // console.log('analysisText', analysisText);
    const prompt = `
📌 Bạn là AI chuyên gia thủy canh ebb & flow.

### Nhiệm vụ:
Dựa vào phần phân tích sau (về giai đoạn sinh trưởng và khuyến nghị số lần bật thiết bị), hãy **tạo ra lịch mới**, đảm bảo:
- Đúng định dạng JSON như mẫu bên dưới.
- Tuân thủ ràng buộc kỹ thuật: không bật cùng lúc pump với thiết bị khác, fan và LED có thể bật cùng.

### Phân tích:
${analysisText}

### Ràng buộc bắt buộc:
- pump: 4–6 lần/ngày, mỗi lần 8–12 phút.
- fan: 6–8 lần/ngày, mỗi lần 5–8 phút.
- led: 6–8 lần/ngày, mỗi lần 90–120 phút.
- nghỉ tối thiểu giữa các lần bật: 10 phút.
- LED + Fan được phép chạy cùng lúc, các thiết bị khác thì không.
- Khung giờ ưu tiên:
  • pump: 06:00–09:00 và 16:00–18:00  
  • fan + led: 06:00–08:00, 17:00–19:00  
  • fan đơn: 09:00–15:00  
- Nếu thiếu khung giờ, có thể dời ±5 phút.

### Định dạng JSON cần trả về:
{
  "note": "${analysisText} -- Giải thích ngắn gọn lý do tạo lịch như vậy...",
  "schedule": [
    {
      "deviceId": "device-001",
      "device": "pumpOn",
      "times": [
        { "start": "06:00", "end": "06:10" },
        ...
      ]
    },
    {
      "deviceId": "device-002",
      "device": "fanOn",
      "times": [ ... ]
    },
    {
      "deviceId": "device-002",
      "device": "ledOn",
      "times": [ ... ]
    }
  ]
}
⛔️ Không ghi chú, không markdown, chỉ trả về JSON đúng cấu trúc trên.
`;
    return await this.chatWithGeminiApi(prompt);
  }

  private extractJson(text: string): ScheduleAIDataDto {
    const cleaned = text.replace(/```json|```/g, '').trim();
    try {
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      const jsonStr = cleaned.slice(start, end + 1);
      return JSON.parse(jsonStr) as ScheduleAIDataDto;
    } catch (err) {
      throw new Error('Không thể parse JSON: ' + err.message);
    }
  }
}

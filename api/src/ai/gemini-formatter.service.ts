// src/ai/gemini-formatter.service.ts
import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ScheduleAIDataDto } from './dto/ai.dto';

@Injectable()
export class GeminiService {
  constructor(private readonly config: ConfigService) {}

  async chatWithGeminiRaw(prompt: string): Promise<string> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('⚠️ Thiếu GEMINI_API_KEY trong biến môi trường!');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      // tùy chọn: nếu bạn có Bearer token, bật dòng dưới
      // Authorization: `Bearer ${apiKey}`,
    };

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    try {
      const res = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        body,
        { headers, timeout: 30000 },
      );

      const text =
        res.data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        (typeof res.data === 'string' ? res.data : '');

      // Trả nguyên văn text (raw) — caller sẽ quyết định xử lý tiếp
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return (text || '').toString();
    } catch (err: any) {
      // Ném lỗi rõ ràng, log chi tiết trên server nếu cần
      const serverMsg = err?.response?.data ?? err?.message ?? err;
      throw new HttpException(
        'Gemini API Error: ' + JSON.stringify(serverMsg),
        500,
      );
    }
  }

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
📌 Bạn là AI chuyên gia thủy canh ebb & flow, có nhiệm vụ **format kết quả phân tích** thành lịch JSON chuẩn.

### Phân tích nhận được:
${analysisText}

### Mục tiêu chính (tưới – pump):
1. Pump phải cấp đủ lượng nước/ngày do Deepseek đề xuất.  
2. Số lần: 4–6 lần/ngày, mỗi lần 8–12 phút.  
3. Ngừng ít nhất 20 phút giữa các lần để ngăn ngập úng.  
4. Khung giờ ưu tiên tưới: **05:30–08:30** và **16:00–19:00** (có thể dời ±5 phút nếu thiếu).  

### Lịch quạt (fan) & LED giữ nguyên:
- Fan: 6–8 lần/ngày, mỗi lần 5–8 phút, khung giờ 06:00–08:00, 09:00–15:00, 17:00–19:00.  
- LED: 6–8 lần/ngày, mỗi lần 90–120 phút, tổng 10–14 giờ/ngày, chạy cùng fan.

### Quy tắc chung:
- Pump không chạy cùng lúc với fan/LED  
- Fan và LED có thể chạy đồng thời  
- Nghỉ tối thiểu giữa mọi phiên bật (bất kể thiết bị): 10 phút  

### Định dạng JSON trả về (chỉ mỗi JSON, không giải thích):
{
  "note": "Tóm tắt kết quả phân tích từ Deepseek: [nơi ghi lại ngắn gọn giai đoạn sinh trưởng, lượng nước/ngày, số lần đề xuất]. Sau đó đưa lý do nổi bật cho lịch này...",
  "schedule": [
    {
      "deviceId": "device-001",
      "device": "pumpOn",
      "times": [
        { "start": "HH:MM", "end": "HH:MM" },
        …
      ]
    },
    {
      "deviceId": "device-001",
      "device": "fanOn",
      "times": [ … ]
    },
    {
      "deviceId": "device-001",
      "device": "ledOn",
      "times": [ … ]
    }
  ]
}
⛔️ Tuyệt đối không kèm markdown hay bất kỳ text nào ngoài JSON.  
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

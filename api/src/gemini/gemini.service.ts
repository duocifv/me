import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { MqttService } from 'src/mqtt/mqtt.service';
import { GeminiResponse } from './dto/gemini.dto';
import { ScheduleService } from 'src/schedule/schedule.service';

@Injectable()
export class GeminiService {
  constructor(
    private readonly cfg: ConfigService,
    private readonly mqttService: MqttService,
    private readonly scheduleService: ScheduleService,
  ) {}

  async generateFinalSchedule() {
    const [camera] = await this.mqttService.findAllCamera();
    const sensor = await this.mqttService.findLastSensor();
    const scheduleOld =
      await this.scheduleService.getScheduleByDevice('device-001');
    console.log('scheduleOld', scheduleOld);
    const scheduleOldText = JSON.stringify(
      scheduleOld.map((s) => ({
        device: s.device,
        times: s.times.map((t) => ({
          start: t.start,
          end: t.end,
        })),
      })),
      null,
      2, // đẹp mắt: indent 2 spaces
    );
    // const result = await this.generateSchedule({
    //   scheduleOld: scheduleOldText,
    //   imageUrl: camera?.url || '',
    //   waterTemperature: sensor?.waterTemperature ?? 0,
    //   ambientTemperature: sensor?.ambientTemperature ?? 0,
    //   humidity: sensor?.humidity ?? 0,
    // });
    const result = await this.generateSchedule({
      scheduleOld: scheduleOldText,
      imageUrl: camera?.url || '',
      waterTemperature: 29,
      ambientTemperature: 30, // thử lại với nhiệt độ trung bình
      humidity: 60, // và độ ẩm ổn định
    });

    const schedule = result.schedule || {};
    const note = result.note || '';

    const convert = (dev?: { times?: any[] }) =>
      dev?.times?.map(({ start, end }) => ({ start, end })) || [];

    return {
      note,
      schedule: [
        {
          device: 'pumpOn',
          deviceId: 'device-001',
          times: convert(schedule.pump),
        },
        {
          device: 'fanOn',
          deviceId: 'device-001',
          times: convert(schedule.fan),
        },
        {
          device: 'ledOn',
          deviceId: 'device-001',
          times: convert(schedule.led),
        },
      ],
    };
  }

  async generateSchedule(input: {
    scheduleOld: string;
    imageUrl: string;
    waterTemperature: number;
    ambientTemperature: number;
    humidity: number;
  }): Promise<GeminiResponse> {
    const prompt = `
📌 Bạn là chuyên gia AI trồng rau muống thủy canh kiểu ebb & flow.

### Hệ thống hiện tại:
- Thùng xốp chứa 8 cây, đậy kín chỉ mở vài lỗ thông gió.
- Giá thể: sơ dừa, dung dịch thủy canh HYDRO OPTIMUM.
- Đèn LED: 4 đỏ + 1 xanh, công suất 1W, điều khiển qua relay.
- Quạt: 2 quạt 5V, **dùng chung 1 relay**, vừa **thông gió** vừa **tản nhiệt cho LED**.
- Bơm: 1 bơm 5V điều khiển tự động.

---

### Môi trường hiện tại:
- Nhiệt độ không khí: ${input.ambientTemperature}°C  
- Độ ẩm: ${input.humidity}%  
- Nhiệt độ nước: ${input.waterTemperature}°C

---

### Giai đoạn sinh trưởng & tham khảo thời lượng/ngày:
- **Nảy mầm (0–5 ngày)**  
  • LED: 12 h/ngày  
  • Pump: 2 × 15 ph  
  • Fan: 0–1 × 10 ph  
- **Cây con (6–14 ngày)**  
  • LED: 12–14 h/ngày  
  • Pump: 3–4 × 10 ph  
  • Fan: 1–2 × 10 ph  
- **Sinh trưởng (15–40 ngày)**  
  • LED: 12–14 h/ngày  
  • Pump: 4–6 × 10 ph  
  • Fan: 3–4 × 10 ph  
- **Hoàn thiện/thu hoạch (41–45 ngày)**  
  • LED: 10–12 h/ngày  
  • Pump: 3–4 × 10 ph  
  • Fan: 1–2 × 10 ph

---

### Lịch thiết bị hiện tại:
${input.scheduleOld}

---

🎯 Nhiệm vụ của bạn:
Hãy tối ưu lại lịch hoạt động **dựa trên điều kiện môi trường**, **giai đoạn sinh trưởng**, và **hiệu suất năng lượng**, đồng thời **tránh gây sốc nhiệt/thừa sáng/thừa gió**. Lịch mới có thể **giữ nguyên một phần** nếu thấy hợp lý.

> **Quan trọng:**  
> - Với giai đoạn cây con và sinh trưởng, ưu tiên LED 14 giờ, pump 4–6 lần, fan 3–4 lần/ngày.  
> - Ở giai đoạn nảy mầm và hoàn thiện, có thể giảm nhẹ tùy điều kiện.

---

### ✅ Ràng buộc (cập nhật)
1. Pump: tối thiểu 4–6 lần/ngày, mỗi lần 8–12 ph, nghỉ 10–15 ph.  
2. Fan: 6–8 lần/ngày, mỗi lần 5–8 ph, nghỉ 10–15 ph.  
3. LED: 6–8 lần/ngày (tổng 12–14 h/ngày), mỗi lần 90–120 ph, nghỉ 30 ph.  
4. Các lần bật của cùng một thiết bị cách nhau ít nhất 10 phút.  
5. **Không để hai thiết bị hoạt động đồng thời**, ngoại trừ **fan** và **LED** phải **chạy cùng lúc** để tản nhiệt.  
6. Thời gian khung hoạt động:  
   - pump: 06:00–09:00 hoặc 16:00–18:00  
   - fan + LED (đồng bộ): 06:00–08:00 và 17:00–19:00  
   - fan đơn lẻ (thông gió): 09:00–15:00  
7. Chia đều các lần trong ngày, tránh dồn giờ; nếu khung giờ quá hẹp, AI có thể linh hoạt tăng/giảm 5 phút để đảm bảo yêu cầu.  


---

### 🔁 Gợi ý phản hồi:
- Hãy đề xuất **lịch chi tiết** cho từng thiết bị, giải thích rõ lý do theo giai đoạn và điều kiện môi trường.  
- Nếu giữ lại một số khung cũ, hãy chỉ ra và giải thích.

---

### ⏬ Trả về đúng định dạng JSON:
{
  "note": "… giải thích logic AI tạo lịch …",
  "schedule": {
    "pump": { "times": [ ... ] },
    "fan": { "times": [ ... ] },
    "led": { "times": [ ... ] }
  }
}
`;

    const headers = {
      'Content-Type': 'application/json',
      'X-goog-api-key': this.cfg.get<string>('GEMINI_API_KEY'),
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
      return this.extractJson(text);
    } catch (err) {
      throw new HttpException('Gemini API Error: ' + err.message, 500);
    }
  }

  private extractJson(text: string): GeminiResponse {
    const cleaned = text.replace(/```json|```/g, '').trim();
    try {
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      const jsonStr = cleaned.slice(start, end + 1);
      return JSON.parse(jsonStr) as GeminiResponse;
    } catch (err) {
      throw new Error('Không thể parse JSON: ' + err.message);
    }
  }
}

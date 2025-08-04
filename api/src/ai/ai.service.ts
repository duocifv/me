import {
  Injectable,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { MqttService } from 'src/mqtt/mqtt.service';
import { ScheduleService } from 'src/schedule/schedule.service';
import { DeviceType } from 'src/sqlite/lite-schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AiLogStatus,
  LiteAiScheduleLog,
} from 'src/sqlite/lite-ai-schedule-log.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import JSON5 from 'json5';
import {
  ScheduleAIDataDto,
  ScheduleAIDataSchema,
  ScheduleAIDto,
} from './dto/ai.dto';

@Injectable()
export class AIService {
  private schedule: ScheduleAIDataDto | null = null;
  constructor(
    private readonly cfg: ConfigService,
    private readonly mqttService: MqttService,
    private readonly scheduleService: ScheduleService,
    @InjectRepository(LiteAiScheduleLog, 'sqlite')
    private readonly aiLogRepo: Repository<LiteAiScheduleLog>,
  ) {}

  async saveAiGeneratedSchedule(input: {
    inputEnv: {
      waterTemperature: number;
      ambientTemperature: number;
      humidity: number;
    };
    schedule: any;
    note: string;
  }) {
    const log = this.aiLogRepo.create({
      inputEnv: input.inputEnv,
      schedule: input.schedule,
      note: input.note,
    });
    return this.aiLogRepo.save(log);
  }

  async updateAiLogReward(
    id: string,
    reward: number,
    feedback?: string,
  ): Promise<boolean> {
    const result = await this.aiLogRepo.update(id, {
      reward,
      feedback,
      status: AiLogStatus.Evaluated,
      evaluatedAt: new Date(),
    });

    return result.affected === 1;
  }

  async getAllAiLogs() {
    return this.aiLogRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async applyFinalSchedule(): Promise<{ updated: number | string } | null> {
    // Bỏ qua nếu schedule chưa được generate
    if (!this.schedule || this.schedule?.schedule?.length < 1) {
      return null;
    }

    const parse = this.schedule;

    // validate:
    const result = ScheduleAIDataSchema.safeParse(parse);
    if (!result.success) {
      console.warn(
        '[Gemini] ❌ Invalid schedule format:',
        result.error.format(),
      );
      throw new UnauthorizedException('Invalid schedule format');
    }
    // Debug trước khi lưu
    console.log('[Gemini] New schedule items:', result);
    const items = result.data.schedule;
    // Xóa toàn bộ lịch cũ
    await this.scheduleService.deleteAllSchedules();

    // Lưu từng lịch mới
    for (const item of items) {
      await this.scheduleService.saveSchedule(item.deviceId, {
        device: item.device as DeviceType, // đã đúng định dạng
        times: item.times,
        repeatOn: [0, 1, 2, 3, 4, 5, 6], // Cả tuần
        isEnabled: true,
      });
    }

    return { updated: items.length };
  }

  async buildAiScheduleFeedbackPrompt(take = 5): Promise<string> {
    const history = await this.aiLogRepo.find({
      where: { status: AiLogStatus.Evaluated },
      order: { evaluatedAt: 'DESC' },
      take,
    });

    if (!history.length) {
      return '⚠️ Chưa có lịch nào được đánh giá trước đó.';
    }

    return history
      .map((h, i) => {
        const env = h.inputEnv || {};
        const rewardText = typeof h.reward === 'number' ? h.reward : 'chưa rõ';
        const noteText = h.note || 'Không có ghi chú';
        const feedbackText = h.feedback ? `Phản hồi: ${h.feedback}` : '';
        const timeText = h.evaluatedAt
          ? `⏱️ Đánh giá lúc: ${new Date(h.evaluatedAt).toLocaleString()}`
          : '';

        return `#${i + 1}
Môi trường: Nước ${env.waterTemperature}°C, Không khí ${env.ambientTemperature}°C, Độ ẩm ${env.humidity}%
Điểm đánh giá: ${rewardText}
Ghi chú: ${noteText}
${feedbackText}
${timeText}

Schedule:
${JSON.stringify(h.schedule, null, 2)}`;
      })
      .join('\n\n');
  }

  async getTopRatedLogsText(limit = 3): Promise<string> {
    const topLogs = await this.aiLogRepo.find({
      where: {
        status: AiLogStatus.Evaluated,
        reward: MoreThanOrEqual(5),
      },
      order: { reward: 'DESC' },
      take: limit,
    });

    if (!topLogs.length) return 'Chưa có lịch tốt nào.';

    return topLogs
      .map((log, i) => {
        const env = log.inputEnv || {};
        const reward = log.reward ?? '?';
        const note = log.note || 'Không có ghi chú';
        return `#${i + 1}
Môi trường: Nước ${env.waterTemperature}°C, Không khí ${env.ambientTemperature}°C, Độ ẩm ${env.humidity}%
Điểm: ${reward}
Ghi chú: ${note}
${JSON.stringify(log.schedule, null, 2)}`;
      })
      .join('\n\n');
  }

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
    const generateSchedule = await this.generateSchedule({
      scheduleOld: scheduleOldText,
      imageUrl: camera?.url || '',
      waterTemperature: 29,
      ambientTemperature: 30, // thử lại với nhiệt độ trung bình
      humidity: 60, // và độ ẩm ổn định
    });

    // validate:
    const result = ScheduleAIDataSchema.safeParse(generateSchedule);
    if (!result.success) {
      console.warn(
        '[Gemini] ❌ Invalid schedule format:',
        result.error.format(),
      );
      return null;
    }

    await this.saveAiGeneratedSchedule({
      inputEnv: {
        waterTemperature: 29,
        ambientTemperature: 30,
        humidity: 60,
      },
      note: result.data.note ?? '',
      schedule: result.data.schedule,
    });

    return result.data;
  }

  async generateSchedule(input: {
    scheduleOld: string;
    imageUrl: string;
    waterTemperature: number;
    ambientTemperature: number;
    humidity: number;
  }): Promise<ScheduleAIDataDto> {
    const [topSection, feedbackSection] = await Promise.all([
      this.getTopRatedLogsText(3),
      this.buildAiScheduleFeedbackPrompt(5),
    ]);
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

### 🏆 Top 3 lịch tốt nhất trước đây (được người thật đánh giá cao):
${topSection}

---

### 📚 Các lịch AI trước đây đã được đánh giá
${feedbackSection}

Top 3 lịch tốt nhất trước đây (được người thật đánh giá cao):

🎯 Nhiệm vụ của bạn:
Hãy tối ưu lại lịch hoạt động **dựa trên điều kiện môi trường**, **giai đoạn sinh trưởng**, và **hiệu suất năng lượng**, đồng thời **tránh gây sốc nhiệt/thừa sáng/thừa gió**. Lịch mới có thể **giữ nguyên một phần** nếu thấy hợp lý.

> **Quan trọng:**  
> - Với giai đoạn cây con và sinh trưởng, ưu tiên LED 14 giờ, pump 4–6 lần, fan 3–4 lần/ngày.  
> - Ở giai đoạn nảy mầm và hoàn thiện, có thể giảm nhẹ tùy điều kiện.
> Với lịch có đánh giá thấp (reward < 0), tránh lặp lại cấu trúc cũ.
> Với lịch có đánh giá cao (reward > 5), có thể lấy cảm hứng nếu điều kiện môi trường gần giống.
---

### ✅ Ràng buộc (cập nhật)
1. Pump: tối thiểu 4–6 lần/ngày, mỗi lần 8–12 ph, nghỉ 10–15 ph.  
2. Fan: 6–8 lần/ngày, mỗi lần 5–8 ph, nghỉ 10–15 ph.  
3. LED: tổng thời gian 12–14 giờ/ngày, chia thành **6–8 lần bật**, mỗi lần **90–120 phút**, **nghỉ ít nhất 30 phút giữa các lần**.  
   ➤ Không bật LED liên tục quá 2 giờ liền.  
   ➤ Ưu tiên chia đều trong ngày, **sáng (6h–9h), trưa (11h–13h), chiều (17h–19h)**.
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
  "schedule": [
    {
      "device": "pumpOn",
      "deviceId": "device-001",
      "times": [
        { "start": "06:00", "end": "06:10" },
        ...
      ]
    },
    {
      "device": "fanOn",
      "deviceId": "device-001",
      "times": [
        { "start": "06:00", "end": "07:30" },
        ...
      ]
    },
    {
      "device": "ledOn",
      "deviceId": "device-001",
      "times": [
        { "start": "06:00", "end": "07:30" },
        ...
      ]
    }
  ]
}

`;

    const body: {
      model: string;
      messages: { role: 'user' | 'system' | 'assistant'; content: string }[];
      temperature: number;
    } = {
      model: 'anthropic/claude-3-haiku',
      messages: [
        {
          role: 'system',
          content: 'Bạn là AI chuyên thiết kế lịch trồng rau muống thủy canh.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    };

    const text = await this.chatWithOpenRouter(body);
    const data = this.extractJson(text);
    return data;
  }

  private extractJson(text: string): ScheduleAIDataDto {
    const cleaned = text.replace(/```json|```/g, '').trim();
    try {
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      const jsonStr = cleaned.slice(start, end + 1);

      // Xử lý dấu xuống dòng không hợp lệ (nếu JSON.parse lỗi thì dùng JSON5 làm fallback)
      try {
        return JSON.parse(jsonStr) as ScheduleAIDto;
      } catch {
        return JSON5.parse(jsonStr);
      }
    } catch (err) {
      throw new Error('Không thể parse JSON: ' + err.message);
    }
  }
  async chatWithOpenRouter({
    model,
    messages,
    temperature = 0.7,
  }: {
    model: string;
    messages: { role: 'user' | 'system' | 'assistant'; content: string }[];
    temperature?: number;
  }) {
    const apiKey = this.cfg.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      throw new Error('⚠️ Thiếu OPENAI_API_KEY trong biến môi trường!');
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://duocnv.top', // 🔒 Bắt buộc! Dùng tên miền thật nếu deploy
      'X-Title': 'hydro-schedule', // không bắt buộc
    };

    const body = {
      model,
      messages,
      temperature,
    };

    try {
      const res = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        body,
        { headers },
      );

      const text: string = res.data?.choices?.[0]?.message?.content ?? '';
      return text;
    } catch (err) {
      throw new HttpException(
        'OpenRouter API Error: ' + (err.response?.data?.message || err.message),
        500,
      );
    }
  }
}

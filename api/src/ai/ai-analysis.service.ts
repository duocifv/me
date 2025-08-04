// src/ai/ai-analysis.service.ts
import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { MqttService } from 'src/mqtt/mqtt.service';
import { ScheduleService } from 'src/schedule/schedule.service';

@Injectable()
export class OpenRouterAnalysisService {
  constructor(
    private readonly config: ConfigService,
    private readonly mqttService: MqttService,
    private readonly scheduleService: ScheduleService,
  ) {}

  async chatWithOpenRouter({
    model,
    messages,
  }: {
    model: string;
    messages: { role: 'user' | 'system' | 'assistant'; content: string }[];
  }) {
    const apiKey = this.config.get<string>('OPENROUTER_API_KEY');
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
    };

    try {
      const res = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        body,
        {
          headers,
        },
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
  async analyzeHydroponicSystem(): Promise<string> {
    const apiKey = this.config.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) throw new Error('⚠️ Thiếu OPENROUTER_API_KEY');

    // const [topSection, feedbackSection] = await Promise.all([
    //   this.getTopRatedLogsText(3),
    //   this.buildAiScheduleFeedbackPrompt(5),
    // ]);
    const [camera] = await this.mqttService.findAllCamera();
    const sensor = await this.mqttService.findLastSensor();
    const scheduleOld =
      await this.scheduleService.getScheduleByDevice('device-001');

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
    const prompt = `
📌 Bạn là chuyên gia phân tích hệ thống thủy canh ebb & flow trồng rau muống.

### Mục tiêu:
Phân tích lịch hoạt động hiện tại, kết hợp dữ liệu môi trường, để:
1. Xác định giai đoạn sinh trưởng hiện tại.
2. Đưa ra nhận định về việc **tăng/giảm** số lần bật/ngày của từng thiết bị: pump, fan, led.
3. Gợi ý thời lượng mỗi lần bật, khung giờ hợp lý trong ngày.

### Lịch thiết bị hiện tại:
${scheduleOldText}

### Môi trường:
- 🌡️ Nhiệt độ nước: ${29}°C  
- 🌡️ Nhiệt độ không khí: ${30}°C  
- 💧 Độ ẩm: ${5}%

👉 Vui lòng trả lời bằng văn bản. Không cần định dạng JSON.
`;

    const body: {
      model: string;
      messages: { role: 'user' | 'system' | 'assistant'; content: string }[];
    } = {
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    const text = await this.chatWithOpenRouter(body);

    return text;
  }
}

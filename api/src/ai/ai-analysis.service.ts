// src/ai/ai-analysis.service.ts
import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { MqttService } from 'src/mqtt/mqtt.service';
import { ScheduleService } from 'src/schedule/schedule.service';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AiLogStatus,
  LiteAiScheduleLog,
} from 'src/sqlite/lite-ai-schedule-log.entity';

@Injectable()
export class OpenRouterAnalysisService {
  constructor(
    private readonly config: ConfigService,
    private readonly mqttService: MqttService,
    private readonly scheduleService: ScheduleService,
    @InjectRepository(LiteAiScheduleLog, 'sqlite')
    private readonly aiLogRepo: Repository<LiteAiScheduleLog>,
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

  async analyzeHydroponicSystem(): Promise<string> {
    const apiKey = this.config.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) throw new Error('⚠️ Thiếu OPENROUTER_API_KEY');

    const [topSection, feedbackSection] = await Promise.all([
      this.getTopRatedLogsText(3),
      this.buildAiScheduleFeedbackPrompt(5),
    ]);
    const [camera] = await this.mqttService.findAllCamera();
    // const sensor = await this.mqttService.findLastSensor();
    // const scheduleOld =
    //   await this.scheduleService.getScheduleByDevice('device-001');
    // const scheduleOldText = JSON.stringify(
    //   scheduleOld.map((s) => ({
    //     device: s.device,
    //     times: s.times.map((t) => ({
    //       start: t.start,
    //       end: t.end,
    //     })),
    //   })),
    //   null,
    //   2, // đẹp mắt: indent 2 spaces
    // );
    const prompt = `
📌 Bạn là một chuyên gia AI thủy canh ebb & flow với nền tảng kỹ thuật cao.

### 1. Dữ liệu logs (Top rated):
${topSection}

### 2. Phản hồi từ lần chạy trước:
${feedbackSection}

### 3. Mô tả hệ thống:
- Thiết bị pump (device-001) lưu lượng 2 L/phút.
- Camera giám sát (ID: ${camera.id}, vị trí: ${camera.url}).
- Cảm biến:
  • Nhiệt độ nước: ${29}°C  
  • Nhiệt độ không khí: ${32}°C  
  • Độ ẩm: ${60}%  

### 4. Mục tiêu:
1. Xác định giai đoạn sinh trưởng hiện tại dựa trên logs, feedback, và dữ liệu môi trường.  
2. Tính toán lượng nước cần thiết/ngày, số lần và thời lượng tưới phù hợp.  
3. Đưa ra khung giờ tưới ưu tiên (sáng sớm, chiều mát).

### Yêu cầu trả về:
- Văn bản phân tích chi tiết, không cần JSON.
`;

    const body: {
      model: string;
      messages: { role: 'user' | 'system' | 'assistant'; content: string }[];
    } = {
      model: 'openai/gpt-oss-20b:free',
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

  async analyzeMedical(report: string): Promise<string> {
    const apiKey = this.config.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) throw new Error('⚠️ Thiếu OPENROUTER_API_KEY');

    const prompt = `
Bạn là chuyên gia y khoa. Dưới đây là thông tin bệnh nhân:
### ${report} ###
Hãy soạn một trả lời Y KHOA CÓ CẤU TRÚC bao gồm các mục sau:
Tóm tắt ngắn về triệu chứng và tiền sử bệnh.
Những chẩn đoán khả dĩ (differential diagnoses), kèm ước lượng mức độ khả năng (cao, trung bình, thấp).
Các xét nghiệm hoặc thăm khám cần thiết, phân loại theo mức độ ưu tiên.
Phác đồ xử trí hoặc điều trị đề xuất, bao gồm xử trí cấp cứu nếu cần.
Các dấu hiệu cảnh báo (red flags) cần lưu ý.
Ghi chú về giới hạn thông tin và khuyến cáo bệnh nhân nên khám bác sĩ chuyên khoa để được chẩn đoán chính xác.
Trả lời ngắn gọn, rõ ràng, dùng bullet points hoặc danh sách số. Không đưa ra kết luận tuyệt đối, nên kèm mức độ chắc chắn.

### Yêu cầu trả về:
- Văn bản phân tích chi tiết, không cần JSON.
`;

    const body: {
      model: string;
      messages: { role: 'user' | 'system' | 'assistant'; content: string }[];
    } = {
      model: 'openai/gpt-oss-20b:free',
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

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ScheduleService } from 'src/schedule/schedule.service';
import { DeviceType } from 'src/sqlite/lite-schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AiLogStatus,
  LiteAiScheduleLog,
} from 'src/sqlite/lite-ai-schedule-log.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { ScheduleAIDataDto, ScheduleAIDataSchema } from './dto/ai.dto';
import { OpenRouterAnalysisService } from './ai-analysis.service';
import { GeminiService } from './gemini-formatter.service';

@Injectable()
export class AIService {
  private schedule: ScheduleAIDataDto | null = null;
  constructor(
    private readonly geminiService: GeminiService,
    private readonly openRouterAnalysisService: OpenRouterAnalysisService,
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
    if (!this.schedule) {
      throw new UnauthorizedException('Invalid schedule no');
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
    const analysis =
      await this.openRouterAnalysisService.analyzeHydroponicSystem();
    console.log('analysisText', analysis);

    const generateSchedule =
      await this.geminiService.convertGeminiToSchedule(analysis);

    // validate:
    const result = ScheduleAIDataSchema.safeParse(generateSchedule);
    if (!result.success) {
      console.warn(
        '[Gemini] ❌ Invalid schedule format:',
        result.error.format(),
      );
      return null;
    }

    this.schedule = result.data;
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
}

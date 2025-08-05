import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ScheduleService } from 'src/schedule/schedule.service';
import { DeviceType } from 'src/sqlite/lite-schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AiLogStatus,
  LiteAiScheduleLog,
} from 'src/sqlite/lite-ai-schedule-log.entity';
import { Repository } from 'typeorm';
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
    const rep = {
      ...result.data,
      note: result.data.note + analysis,
    };
    this.schedule = rep;
    await this.saveAiGeneratedSchedule({
      inputEnv: {
        waterTemperature: 29,
        ambientTemperature: 30,
        humidity: 60,
      },
      note: result.data.note ?? '',
      schedule: result.data.schedule,
    });

    return rep;
  }
}

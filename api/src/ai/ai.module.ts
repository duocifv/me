// src/gemini/gemini.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { ScheduleTaskModule } from 'src/schedule/schedule.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiteAiScheduleLog } from 'src/sqlite/lite-ai-schedule-log.entity';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { OpenRouterAnalysisService } from './ai-analysis.service';
import { GeminiService } from './gemini-formatter.service';

@Module({
  imports: [
    forwardRef(() => MqttModule),
    ScheduleTaskModule,
    TypeOrmModule.forFeature([LiteAiScheduleLog], 'sqlite'),
  ],
  controllers: [AIController],
  providers: [AIService, GeminiService, OpenRouterAnalysisService],
  exports: [AIService],
})
export class AIModule {}

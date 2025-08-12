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
import { MedalpacaService } from './medalpaca.service';
import { LiteMedical } from 'src/sqlite/lite-medical.entity';

@Module({
  imports: [
    forwardRef(() => MqttModule),
    ScheduleTaskModule,
    TypeOrmModule.forFeature([LiteAiScheduleLog, LiteMedical], 'sqlite'),
  ],
  controllers: [AIController],
  providers: [
    AIService,
    GeminiService,
    OpenRouterAnalysisService,
    MedalpacaService,
  ],
  exports: [AIService],
})
export class AIModule {}

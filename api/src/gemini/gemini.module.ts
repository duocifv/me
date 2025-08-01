// src/gemini/gemini.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { GeminiController } from './gemini.controller';
import { ScheduleTaskModule } from 'src/schedule/schedule.module';

@Module({
  imports: [forwardRef(() => MqttModule), ScheduleTaskModule],
  controllers: [GeminiController],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}

// src/mqtt/mqtt.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { MqttController } from './mqtt.controller';
import { RedisModule } from 'src/redis/redis.module';
import { ScheduleTaskModule } from 'src/schedule/schedule.module';

@Module({
  imports: [RedisModule, forwardRef(() => ScheduleTaskModule)],
  controllers: [MqttController],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}

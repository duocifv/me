// src/mqtt/mqtt.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { MqttController } from './mqtt.controller';
import { RedisModule } from 'src/redis/redis.module';
import { ScheduleTaskModule } from 'src/schedule/schedule.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiteCamera } from '../sqlite/lite-camera.entity';
import { LiteErrors } from '../sqlite/lite-errors.entity';
import { LiteSensors } from '../sqlite/lite-sensors.entity';
import { LiteSchedule } from 'src/sqlite/lite-schedule.entity';

@Module({
  imports: [
    RedisModule,
    forwardRef(() => ScheduleTaskModule),
    TypeOrmModule.forFeature(
      [LiteCamera, LiteErrors, LiteSensors, LiteSchedule],
      'sqlite',
    ),
  ],
  controllers: [MqttController],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}

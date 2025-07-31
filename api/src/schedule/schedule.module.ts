import { forwardRef, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronTaskSchedule } from './schedule.task';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { RedisService } from 'src/redis/redis.service';
import { MqttService } from 'src/mqtt/mqtt.service';
import { RedisModule } from 'src/redis/redis.module';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiteSchedule } from '../sqlite/lite-schedule.entity';
import { LiteCamera } from 'src/sqlite/lite-camera.entity';
import { LiteErrors } from 'src/sqlite/lite-errors.entity';
import { LiteSensors } from 'src/sqlite/lite-sensors.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RedisModule,
    forwardRef(() => MqttModule),
    TypeOrmModule.forFeature(
      [LiteCamera, LiteErrors, LiteSensors, LiteSchedule],
      'sqlite',
    ),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService, CronTaskSchedule, RedisService, MqttService],
  exports: [ScheduleService],
})
export class ScheduleTaskModule {}

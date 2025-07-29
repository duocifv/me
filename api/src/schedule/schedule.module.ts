import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronTaskSchedule } from './schedule.task';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { RedisService } from 'src/redis/redis.service';
import { MqttService } from 'src/mqtt/mqtt.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [ScheduleModule.forRoot(), RedisModule],
  controllers: [ScheduleController],
  providers: [ScheduleService, CronTaskSchedule, RedisService, MqttService],
})
export class ScheduleTaskModule {}

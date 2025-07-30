import { forwardRef, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronTaskSchedule } from './schedule.task';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { RedisService } from 'src/redis/redis.service';
import { MqttService } from 'src/mqtt/mqtt.service';
import { RedisModule } from 'src/redis/redis.module';
import { MqttModule } from 'src/mqtt/mqtt.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RedisModule,
    forwardRef(() => MqttModule),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService, CronTaskSchedule, RedisService, MqttService],
  exports: [ScheduleService],
})
export class ScheduleTaskModule {}

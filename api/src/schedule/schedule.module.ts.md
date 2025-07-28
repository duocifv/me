import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronSchedule } from './schedule.task';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [ScheduleController],
  providers: [ScheduleService, CronSchedule],
})
export class DeviceModule {}

// update-device-config.task.ts

import { Injectable } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronTaskSchedule {
  private counter = 0;

  constructor(private readonly scheduleService: ScheduleService) {}

  @Cron('*/1 * * * *') // mỗi phút
  async handle() {
    this.counter++;
    console.log(`[CRON] - Run #${this.counter}`);

    const ids = ['device-001'];
    for (const id of ids) {
      await this.scheduleService.applyScheduleAndUpdateConfig(id);
    }
  }

  // 👇 Hàm để controller gọi xem cron đã chạy mấy lần
  getRunCount() {
    return this.counter;
  }
}

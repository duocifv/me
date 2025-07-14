// update-device-config.task.ts

import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DeviceService } from '../v1/device.service';

@Injectable()
export class UpdateDeviceConfigTask {
  private counter = 0;

  constructor(private readonly deviceService: DeviceService) {}

  @Cron('*/10 * * * * *')
  async handle() {
    this.counter++;
    console.log(
      `[CRON] ${new Date().toLocaleTimeString()} - Run #${this.counter}`,
    );

    const ids = await this.deviceService.getAllDeviceIds();
    for (const id of ids) {
      await this.deviceService.applyScheduleAndUpdateConfig(id);
    }
  }

  // 👇 Hàm để controller gọi xem cron đã chạy mấy lần
  getRunCount() {
    return this.counter;
  }
}

// src/device/tasks/update-device-config.task.ts

import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DeviceService } from '../v1/device.service';

@Injectable()
export class UpdateDeviceConfigTask {
  constructor(private readonly deviceService: DeviceService) {}

  @Cron('*/1 * * * *') // chạy mỗi phút
  async handle() {
    const ids = await this.deviceService.getAllDeviceIds();
    for (const id of ids) {
      await this.deviceService.applyScheduleAndUpdateConfig(id);
    }
  }
}

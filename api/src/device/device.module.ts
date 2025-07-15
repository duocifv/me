import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule'; // 👈 thêm dòng này

import { DeviceService } from './v1/device.service';
import { DeviceConfigEntity } from './entities/device-config.entity';
import { DeviceErrorEntity } from './entities/device-error.entity';
import { DeviceController } from './v1/device.controller';
import { DeviceScheduleEntity } from './entities/device-schedule.entity';
import { UpdateDeviceConfigTask } from './tasks/update-device-config.task';
import { DeviceScheduleController } from './v1/device-schedule.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      DeviceConfigEntity,
      DeviceErrorEntity,
      DeviceScheduleEntity,
    ]),
  ],
  controllers: [DeviceController, DeviceScheduleController],
  providers: [DeviceService, UpdateDeviceConfigTask],
})
export class DeviceModule {}

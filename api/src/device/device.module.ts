import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceService } from './v1/device.service';
import { DeviceConfigEntity } from './entities/device-config.entity';
import { DeviceErrorEntity } from './entities/device-error.entity';
import { DeviceController } from './v1/device.controller';
import { DeviceScheduleEntity } from './entities/device-schedule.entity';
import { UpdateDeviceConfigTask } from './tasks/update-device-config.task';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeviceConfigEntity,
      DeviceErrorEntity,
      DeviceScheduleEntity,
    ]),
  ],
  controllers: [DeviceController],
  providers: [DeviceService, UpdateDeviceConfigTask],
})
export class DeviceModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule'; // 👈 thêm dòng này

import { DeviceService } from './v1/device.service';
import { DeviceConfigEntity } from './entities/device-config.entity';
import { DeviceErrorEntity } from './entities/device-error.entity';
import { DeviceController } from './v1/device.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([DeviceConfigEntity, DeviceErrorEntity]),
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}

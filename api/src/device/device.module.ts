import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceService } from './v1/device.service';
import { DeviceConfigEntity } from './entities/device-config.entity';
import { DeviceErrorEntity } from './entities/device-error.entity';
import { DeviceController } from './v1/device.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceConfigEntity, DeviceErrorEntity])],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}

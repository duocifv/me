import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { DeviceConfigEntity } from './entities/device-config.entity';
import { DeviceErrorEntity } from './dto/device-error.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceConfigEntity, DeviceErrorEntity])],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}

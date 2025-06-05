// src/device-config/device-config.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceConfigController } from './device-config.controller';
import { DeviceConfigService } from './device-config.service';
import { DeviceConfigEntity } from './entities/device-config.entity';

@Module({
  imports: [
    // Đăng ký Entity để TypeORM tạo repository tương ứng
    TypeOrmModule.forFeature([DeviceConfigEntity]),
  ],
  controllers: [DeviceConfigController],
  providers: [DeviceConfigService],
  exports: [DeviceConfigService],
})
export class DeviceConfigModule {}

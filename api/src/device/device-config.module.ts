import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceConfigController } from './device-config.controller';
import { DeviceConfigService } from './device-config.service';
import { DeviceConfigEntity } from './entities/device-config.entity';
import { DeviceErrorEntity } from './dto/device-error.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceConfigEntity, DeviceErrorEntity]),
  ],
  controllers: [DeviceConfigController],
  providers: [DeviceConfigService],
})
export class DeviceConfigModule {}

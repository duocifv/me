// src/device-config/device-config.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeviceConfigDto } from './dto/create-device-config.dto';
import { DeviceConfigEntity } from './entities/device-config.entity';

@Injectable()
export class DeviceConfigService {
  constructor(
    @InjectRepository(DeviceConfigEntity)
    private readonly configRepo: Repository<DeviceConfigEntity>,
  ) {}

  /**
   * Lấy config theo device_id. Nếu không tồn tại thì ném NotFoundException.
   */
  async getConfig(deviceId: string): Promise<DeviceConfigEntity> {
    const cfg = await this.configRepo.findOne({ where: { deviceId } });
    if (!cfg) {
      throw new NotFoundException(
        `Config của device '${deviceId}' chưa tồn tại`,
      );
    }
    return cfg;
  }

  /**
   * Tạo hoặc cập nhật config.
   * Nếu đã có record với device_id đó, thì update; còn không thì create mới.
   */
  async createOrUpdateConfig(
    dto: CreateDeviceConfigDto,
  ): Promise<DeviceConfigEntity> {
    const existing = await this.configRepo.findOne({
      where: { deviceId: dto.deviceId },
    });

    const fieldsToUpdate = {
      wifiSsid: dto.wifiSsid,
      wifiPassword: dto.wifiPassword,
      deepSleepIntervalUs: dto.deepSleepIntervalUs,
      pumpOnTimeMs: dto.pumpOnTimeMs,
      sensorEndpoint: dto.sensorEndpoint,
      cameraEndpoint: dto.cameraEndpoint,
      deviceToken: dto.deviceToken,
      sensorInterval: dto.sensorInterval,
      dataInterval: dto.dataInterval,
      imageInterval: dto.imageInterval,
      pumpCycleMs: dto.pumpCycleMs,
      pumpOnMs: dto.pumpOnMs,
    };

    try {
      if (existing) {
        Object.assign(existing, fieldsToUpdate);
        return await this.configRepo.save(existing);
      } else {
        const newEntity = this.configRepo.create({
          deviceId: dto.deviceId,
          ...fieldsToUpdate,
        });
        return await this.configRepo.save(newEntity);
      }
    } catch (err) {
      throw new InternalServerErrorException('Lỗi khi lưu config vào DB');
    }
  }
}

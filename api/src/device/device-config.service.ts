// src/device-config/device-config.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeviceConfigDto } from './dto/create-device-config.dto';
import { DeviceConfigEntity } from './entities/device-config.entity';
import { DeviceErrorEntity } from './dto/device-error.entity';
import { ReportDeviceErrorDto } from './dto/report-device-error.dto';

@Injectable()
export class DeviceConfigService {
  private readonly logger = new Logger(DeviceConfigService.name);

  
  constructor(
     @InjectRepository(DeviceConfigEntity)
    private readonly cfgRepo: Repository<DeviceConfigEntity>,

    @InjectRepository(DeviceErrorEntity)
    private readonly errRepo: Repository<DeviceErrorEntity>,
  ) {}

  async reportDeviceError(dto: ReportDeviceErrorDto): Promise<void> {
    // Build data object, chỉ include reportedAt nếu có timestamp
    const data: Partial<DeviceErrorEntity> = {
      deviceId: dto.device_id,
      deviceToken: dto.device_token,
      errorCode: dto.error_code,
      errorMessage: dto.error_message,
      // không gán reportedAt nếu dto.timestamp undefined/null
      ...(dto.timestamp && { reportedAt: new Date(dto.timestamp) }),
    };

    // tạo entity từ data (object, không phải array)
    const errEntity = this.errRepo.create(data);

    // lưu vào DB
    await this.errRepo.save(errEntity);

    // log thêm
    this.logger.error(
      `[ESP32][${dto.device_id}] code=${dto.error_code} msg="${dto.error_message}" ts=${dto.timestamp || 'n/a'}`
    );
  }
  
  /**
   * Lấy config theo device_id. Nếu không tồn tại thì ném NotFoundException.
   */
  async getConfig(deviceId: string): Promise<DeviceConfigEntity> {
    const cfg = await this.cfgRepo.findOne({ where: { deviceId } });
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
    const existing = await this.cfgRepo.findOne({
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
        return await this.cfgRepo.save(existing);
      } else {
        const newEntity = this.cfgRepo.create({
          deviceId: dto.deviceId,
          ...fieldsToUpdate,
        });
        return await this.cfgRepo.save(newEntity);
      }
    } catch (err) {
      throw new InternalServerErrorException('Lỗi khi lưu config vào DB');
    }
  }
}

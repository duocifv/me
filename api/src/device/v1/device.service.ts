// src/device-config/device-config.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeviceConfigDto } from '../dto/create-device-config.dto';
import { DeviceConfigEntity } from '../entities/device-config.entity';
import { DeviceErrorEntity } from '../entities/device-error.entity';
import { ReportDeviceErrorDto } from '../dto/report-device-error.dto';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(
    @InjectRepository(DeviceConfigEntity)
    private readonly cfgRepo: Repository<DeviceConfigEntity>,

    @InjectRepository(DeviceErrorEntity)
    private readonly errRepo: Repository<DeviceErrorEntity>,
  ) {}

  /** Ghi nhận lỗi */
  async reportDeviceError(
    deviceId: string,
    { error_code, error_message }: ReportDeviceErrorDto,
  ): Promise<{ success: true }> {
    await this.errRepo.save(
      this.errRepo.create({
        deviceId,
        errorCode: error_code,
        errorMessage: error_message,
      }),
    );
    return { success: true };
  }

  /** Lấy lỗi */
  async getDeviceErrors(deviceId: string): Promise<DeviceErrorEntity[]> {
    return this.errRepo.find({
      where: { deviceId },
      order: { createdAt: 'DESC' },
    });
  }

  /** Lấy config mới nhất */
  async getLatestConfig(deviceId: string): Promise<DeviceConfigEntity> {
    const cfg = await this.cfgRepo.findOne({
      where: { deviceId },
      order: { version: 'DESC' },
    });
    if (!cfg)
      throw new NotFoundException(`No config for deviceId='${deviceId}'`);
    return cfg;
  }

  /** Danh sách version */
  async listConfigVersions(
    deviceId: string,
  ): Promise<{ version: number; createdAt: Date }[]> {
    return this.cfgRepo.find({
      select: ['version', 'createdAt'],
      where: { deviceId },
      order: { version: 'DESC' },
    });
  }

  /** Tạo mới bản config với version tăng dần */
  async upsertWithVersion(
    dto: CreateDeviceConfigDto,
  ): Promise<DeviceConfigEntity> {
    try {
      // tính version mới
      const last = await this.cfgRepo.findOne({
        where: { deviceId: dto.deviceId },
        order: { version: 'DESC' },
      });
      const nextVersion = last ? last.version + 1 : 1;

      const entity = this.cfgRepo.create({ ...dto, version: nextVersion });
      return await this.cfgRepo.save(entity);
    } catch (err) {
      this.logger.error(
        'Error saving config version',
        err.stack || err.message,
      );
      throw new InternalServerErrorException('Cannot save device config');
    }
  }

  /** Rollback: tạo bản config mới dựa trên version cũ */
  async rollbackConfig(
    deviceId: string,
    version: number,
  ): Promise<DeviceConfigEntity> {
    const hist = await this.cfgRepo.findOne({ where: { deviceId, version } });
    if (!hist) throw new NotFoundException('Version not found');

    // tạo bản mới với version tăng
    const latest = await this.cfgRepo.findOne({
      where: { deviceId },
      order: { version: 'DESC' },
    });
    const newVersion = (latest?.version || 0) + 1;
    const clone = this.cfgRepo.create({
      ...hist,
      version: newVersion,
      createdAt: undefined,
      updatedAt: undefined,
    });
    return this.cfgRepo.save(clone);
  }
}

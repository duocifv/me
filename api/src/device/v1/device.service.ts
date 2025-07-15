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
import { DeviceScheduleEntity } from '../entities/device-schedule.entity';
import { DeviceScheduleDto } from '../dto/device-schedule.dto';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(
    @InjectRepository(DeviceScheduleEntity)
    private readonly scheduleRepo: Repository<DeviceScheduleEntity>,

    @InjectRepository(DeviceConfigEntity)
    private readonly cfgRepo: Repository<DeviceConfigEntity>,

    @InjectRepository(DeviceErrorEntity)
    private readonly errRepo: Repository<DeviceErrorEntity>,
  ) { }

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

  /** Lấy 40 lỗi mới nhất của một device */
  async getDeviceErrors(deviceId: string): Promise<DeviceErrorEntity[]> {
    return this.errRepo.find({
      where: { deviceId },
      order: { createdAt: 'DESC' },
      take: 40, // chỉ lấy 40 mẫu tin
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

  async updateConfig(
    deviceId: string,
    partialDto: Partial<CreateDeviceConfigDto>,
  ): Promise<DeviceConfigEntity> {
    // Lấy cấu hình hiện tại mới nhất
    const currentConfig = await this.getLatestConfig(deviceId);
    if (!currentConfig) {
      throw new NotFoundException('Config not found for device ' + deviceId);
    }

    // Cập nhật các trường từ partialDto
    Object.assign(currentConfig, partialDto);

    // Lưu lại (tùy theo cách bạn quản lý version, có thể là upsert hoặc tạo bản mới)
    return this.cfgRepo.save(currentConfig);
  }

  async getLatestConfigbyDevice(deviceId: string) {
    const cfg = await this.cfgRepo.findOne({
      where: { deviceId },
      order: { version: 'DESC' },
    });

    if (!cfg)
      throw new NotFoundException(`No config for deviceId='${deviceId}'`);

    // Gộp lại thành cấu trúc đơn giản hơn
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

      const entity = this.cfgRepo.create({
        ...dto,
        version: nextVersion,
      });
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

  async saveSchedule(deviceId: string, dto: DeviceScheduleDto) {
    await this.scheduleRepo.save({ ...dto, deviceId });
  }

  async getSchedules(deviceId: string): Promise<DeviceScheduleDto[]> {
    return this.scheduleRepo.find({
      where: { deviceId },
      order: { startTime: 'ASC' },
    });
  }

  async applyScheduleAndUpdateConfig(deviceId: string): Promise<void> {
    // 👉 Tạo giờ Việt Nam thủ công (UTC + 7 giờ)
    const nowUTC = new Date();
    const nowVN = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);

    const nowMin = nowVN.getHours() * 60 + nowVN.getMinutes();
    const today = nowVN.getDay(); // 0 = Chủ Nhật, 6 = Thứ Bảy

    const schedules = await this.getSchedules(deviceId);
    const state = { pumpOn: false, fanOn: false, ledOn: false };

    for (const s of schedules) {
      if (!s.isEnabled) continue;

      const days = (s.repeatOn || []).map(Number);
      if (!days.includes(today)) continue;

      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;

      // ✅ Hỗ trợ thời gian chạy qua đêm
      const isActive =
        start <= end
          ? start <= nowMin && nowMin < end
          : nowMin >= start || nowMin < end;

      if (isActive) {
        state.pumpOn ||= s.pumpOn;
        state.fanOn ||= s.fanOn;
        state.ledOn ||= s.ledOn;
      }
    }

    const latest = await this.cfgRepo.findOne({
      where: { deviceId },
      order: { version: 'DESC' },
    });

    if (latest) {
      await this.cfgRepo.update(
        { deviceId: latest.deviceId, version: latest.version },
        state,
      );
    }

    // 👉 Log để kiểm tra
    console.log(
      `[VN TIME] ${nowVN.toLocaleString('vi-VN')} | Updated ${deviceId} →`,
      state,
    );
  }


  async getAllDeviceIds(): Promise<string[]> {
    const rows: { deviceId: string }[] = await this.cfgRepo
      .createQueryBuilder('c')
      .select('DISTINCT c.deviceId', 'deviceId')
      .getRawMany();

    return rows.map((r) => r.deviceId);
  }

  /** Lấy một schedule theo ID */
  async getScheduleById(
    deviceId: string,
    id: number,
  ): Promise<DeviceScheduleEntity> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id, deviceId },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  /** Cập nhật một schedule */
  async updateSchedule(
    deviceId: string,
    id: number,
    dto: DeviceScheduleDto,
  ): Promise<DeviceScheduleEntity> {
    const schedule = await this.getScheduleById(deviceId, id);
    Object.assign(schedule, dto);
    return this.scheduleRepo.save(schedule);
  }

  /** Xoá một schedule */
  async deleteSchedule(deviceId: string, id: number): Promise<void> {
    const schedule = await this.getScheduleById(deviceId, id);
    await this.scheduleRepo.remove(schedule);
  }
}

// src/device-config/device-config.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(
    @InjectRepository(DeviceScheduleEntity)
    private readonly scheduleRepo: Repository<DeviceScheduleEntity>,
  ) {}

  async saveSchedule(deviceId: string, dto: DeviceScheduleDto) {
    await this.scheduleRepo.save({ ...dto, deviceId });
  }

  async getSchedules(deviceId: string): Promise<DeviceScheduleEntity[]> {
    return this.scheduleRepo.find({
      where: { deviceId },
      order: { startTime: 'ASC' },
    });
  }

  async applyScheduleAndUpdateConfig(deviceId: string): Promise<void> {
    // 👉 Giờ Việt Nam (UTC+7)
    const nowVN = DateTime.now().setZone('Asia/Ho_Chi_Minh');
    const hour = nowVN.hour;
    const minute = nowVN.minute;
    const nowMin = hour * 60 + minute;
    const today = nowVN.weekday % 7; // Luxon: 1 (Mon) - 7 (Sun) => chuyển về 0-6 như JS

    // Lấy lịch của thiết bị
    const schedules = await this.getSchedules(deviceId);
    if (!schedules.length) {
      console.warn(`[WARN] No schedules for device ${deviceId}`);
      return;
    }

    const state = { pumpOn: false, fanOn: false, ledOn: false };

    for (const s of schedules) {
      if (!s.isEnabled) continue;

      const days = s.repeatOn?.map(Number) ?? [];
      if (!days.includes(today)) continue;

      // Kiểm tra định dạng thời gian
      if (
        !s.startTime ||
        !s.endTime ||
        !s.startTime.includes(':') ||
        !s.endTime.includes(':')
      ) {
        console.warn(`[WARN] Invalid time format in schedule ID=${s.id}`);
        continue;
      }

      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;

      // ✅ Hỗ trợ chạy qua đêm
      const isActive =
        start <= end
          ? nowMin >= start && nowMin < end
          : nowMin >= start || nowMin < end;

      if (isActive) {
        state.pumpOn ||= s.pumpOn;
        state.fanOn ||= s.fanOn;
        state.ledOn ||= s.ledOn;
      }

      console.log(
        `[SCHEDULE] ID=${s.id} | ${s.startTime}-${s.endTime} | Days=${days.join(',')} | Active=${isActive}`,
      );
    }

    console.log('state0', state);

    // 👉 Nếu không có gì thay đổi, bỏ qua
    if (!state.pumpOn && !state.fanOn && !state.ledOn) {
      console.log(
        `[SKIP] No active schedules at ${nowVN.toFormat('HH:mm dd/MM/yyyy')}`,
      );
      return;
    }

    const latest = await this.cfgRepo.findOne({
      where: { deviceId },
      order: { version: 'DESC' },
    });

    if (!latest) {
      console.warn(`[WARN] No config found for device ${deviceId}`);
      return;
    }

    await this.cfgRepo.update(
      { deviceId: latest.deviceId, version: latest.version },
      state,
    );

    console.log(
      `[VN TIME] ${nowVN.toFormat('HH:mm dd/MM/yyyy')} | Updated ${deviceId} →`,
      state,
    );
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

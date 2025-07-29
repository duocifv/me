// src/device/device.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';
import {
  DeviceConfigState,
  DeviceScheduleDto,
} from './dto/device-schedule.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class ScheduleService {
  private latestConfig: Record<string, DeviceConfigState> = {};

  constructor(private readonly redis: RedisService) {}

  private async getDeviceSchedules(
    deviceId: string,
  ): Promise<DeviceScheduleDto[]> {
    return (
      (await this.redis.get<DeviceScheduleDto[]>(`schedule:${deviceId}`)) ?? []
    );
  }

  private async saveDeviceSchedules(
    deviceId: string,
    schedules: DeviceScheduleDto[],
  ): Promise<void> {
    await this.redis.set(`schedule:${deviceId}`, schedules);
  }

  async saveSchedule(deviceId: string, dto: DeviceScheduleDto): Promise<void> {
    const schedules = await this.getDeviceSchedules(deviceId);
    schedules.push({
      ...dto,
      id: String(Date.now()),
      createdAt: new Date(),
    });
    await this.saveDeviceSchedules(deviceId, schedules);
  }

  async getSchedules(): Promise<Record<string, DeviceScheduleDto[]>> {
    const result: Record<string, DeviceScheduleDto[]> = {};

    // Lấy danh sách key theo pattern
    const keys = await this.redis.keys('schedule:*'); // ví dụ: schedule:device1, schedule:device2

    for (const key of keys) {
      const deviceId = key.replace('schedule:', '');
      const schedule = await this.redis.get<DeviceScheduleDto[]>(key);
      if (schedule) {
        result[deviceId] = schedule;
      }
    }

    return result;
  }

  getLatestConfig(): Record<string, DeviceConfigState> {
    return this.latestConfig;
  }

  async getScheduleById(
    deviceId: string,
    id: string,
  ): Promise<DeviceScheduleDto> {
    const schedules = await this.getDeviceSchedules(deviceId);
    console.log('schedules', schedules, id);
    const found = schedules.find((s) => String(s.id) === String(id));
    if (!found) throw new NotFoundException('Schedule not found');
    return found;
  }

  async updateSchedule(
    deviceId: string,
    id: string,
    dto: DeviceScheduleDto,
  ): Promise<void> {
    const schedules = await this.getDeviceSchedules(deviceId);
    const index = schedules.findIndex((s) => String(s.id) === String(id));
    if (index === -1) throw new NotFoundException('Schedule not found');
    schedules[index] = { ...schedules[index], ...dto };
    await this.saveDeviceSchedules(deviceId, schedules);
  }

  async deleteSchedule(deviceId: string, id: number): Promise<void> {
    const schedules = await this.getDeviceSchedules(deviceId);
    const filtered = schedules.filter((s) => String(s.id) !== String(id));
    await this.saveDeviceSchedules(deviceId, filtered);
  }

  async applyScheduleAndUpdateConfig(deviceId: string): Promise<void> {
    const nowVN = DateTime.now().setZone('Asia/Ho_Chi_Minh');
    const nowMin = nowVN.hour * 60 + nowVN.minute;

    // Chuyển về từ 0 (Chủ Nhật) đến 6 (Thứ Bảy)
    const today = nowVN.weekday % 7;

    const schedules = await this.getDeviceSchedules(deviceId);
    if (!schedules.length) {
      console.warn(`[WARN] Không có lịch nào cho thiết bị ${deviceId}`);
      return;
    }

    const state: DeviceConfigState = {
      pumpOn: false,
      fanOn: false,
      ledOn: false,
      sensor: false,
      camera: false,
    };

    for (const s of schedules) {
      if (!s.isEnabled) continue;

      const days = Array.isArray(s.repeatOn) ? s.repeatOn.map(Number) : [];

      if (!days.includes(today)) continue;
      if (!s.startTime || !s.endTime) continue;

      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;

      const isActive =
        start <= end
          ? nowMin >= start && nowMin < end
          : nowMin >= start || nowMin < end;

      if (isActive) {
        state.pumpOn ||= s.pumpOn;
        state.fanOn ||= s.fanOn;
        state.ledOn ||= s.ledOn;
        state.sensor ||= s.sensor;
        state.camera ||= s.camera;
      }
    }

    const allOff = Object.values(state).every((v) => !v);
    if (allOff) {
      console.log(
        `[SKIP] ${deviceId} - ${nowVN.toFormat('HH:mm')} không có thiết bị nào bật`,
      );
      return;
    }

    this.latestConfig[deviceId] = state;
    console.log(`[UPDATE] ${deviceId} - ${nowVN.toFormat('HH:mm')} →`, state);
  }

  getCurrentConfig(deviceId: string): DeviceConfigState | null {
    return this.latestConfig[deviceId] ?? null;
  }

  async getScheduleByDevice(deviceId: string): Promise<DeviceScheduleDto[]> {
    return await this.getDeviceSchedules(deviceId);
  }
}

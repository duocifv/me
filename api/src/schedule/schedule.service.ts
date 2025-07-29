import { Injectable, NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { DeviceScheduleDto } from './dto/device-schedule.dto';
import { RedisService } from 'src/redis/redis.service';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { MqttService } from 'src/mqtt/mqtt.service';

type DeviceConfigState = Record<
  'pumpOn' | 'ledOn' | 'fanOn' | 'sensor' | 'camera',
  boolean
>;

@Injectable()
export class ScheduleService {
  private latestConfig: Record<string, DeviceConfigState> = {};

  constructor(
    private readonly redis: RedisService,
    private readonly mqtt: MqttService,
  ) {}

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
    schedules.push({ ...dto, id: String(Date.now()) });
    await this.saveDeviceSchedules(deviceId, schedules);
  }

  async getSchedules(): Promise<Record<string, DeviceScheduleDto[]>> {
    const result: Record<string, DeviceScheduleDto[]> = {};
    const keys = await this.redis.keys('schedule:*');
    for (const key of keys) {
      const deviceId = key.replace('schedule:', '');
      const schedule = await this.redis.get<DeviceScheduleDto[]>(key);
      if (schedule) result[deviceId] = schedule;
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
    const found = schedules.find((s) => String(s.id) === String(id));
    if (!found) throw new NotFoundException('Schedule not found');
    return found;
  }

  async updateScheduleByDevice(
    deviceId: string,
    device: string,
    dto: UpdateScheduleDto,
  ): Promise<void> {
    const schedules = await this.getDeviceSchedules(deviceId);
    const index = schedules.findIndex((s) => s.device === device);
    if (index === -1) throw new NotFoundException('Schedule device not found');
    schedules[index] = { ...schedules[index], ...dto };
    await this.saveDeviceSchedules(deviceId, schedules);
  }

  async updateSchedule(
    deviceId: string,
    id: string,
    dto: UpdateScheduleDto,
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
    const today = nowVN.weekday % 7;

    const schedules = await this.getDeviceSchedules(deviceId);
    if (!schedules.length) {
      console.warn(`[WARN] No schedules for ${deviceId}`);
      return;
    }

    const activeStates = {
      pumpOn: false,
      ledOn: false,
      fanOn: false,
      sensor: false,
      camera: false,
    };

    for (const schedule of schedules) {
      if (!schedule.isEnabled) continue;
      if (!schedule.repeatOn.includes(today)) continue;

      for (const time of schedule.times) {
        const [sh, sm] = time.start.split(':').map(Number);
        const [eh, em] = time.end.split(':').map(Number);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;

        const isActive =
          start <= end
            ? nowMin >= start && nowMin < end
            : nowMin >= start || nowMin < end;

        if (isActive) {
          activeStates[schedule.device] = true;
          break; // Không cần kiểm tra thêm times của cùng device
        }
      }
    }

    const allOff = Object.values(activeStates).every((v) => !v);
    if (allOff) {
      console.log(
        `[SKIP] ${deviceId} - ${nowVN.toFormat('HH:mm')} no devices ON`,
      );
      return;
    }

    this.latestConfig[deviceId] = activeStates;
    console.log(
      `[UPDATE] ${deviceId} - ${nowVN.toFormat('HH:mm')} →`,
      activeStates,
    );

    await this.mqtt.handleControlCommand(activeStates);
  }

  getCurrentConfig(deviceId: string): DeviceConfigState | null {
    return this.latestConfig[deviceId] ?? null;
  }

  async getScheduleByDevice(deviceId: string): Promise<DeviceScheduleDto[]> {
    return await this.getDeviceSchedules(deviceId);
  }
}

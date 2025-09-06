import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DateTime } from 'luxon';
import { DeviceScheduleDto, DeviceType } from './dto/device-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { MqttService } from 'src/mqtt/mqtt.service';
import { UpdateControlDto } from 'src/mqtt/dto/control.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LiteSchedule } from '../sqlite/lite-schedule.entity';
import { nowVNDate } from 'src/shared/utils/time';

@Injectable()
export class ScheduleService {
  public health: boolean = false;
  private latestConfig: UpdateControlDto = {
    pump: false,
    led: false,
    fanCool: false,
    fanVent: false,
    sensors: false,
    camera: false,
  };

  constructor(
    @Inject(forwardRef(() => MqttService))
    private readonly mqtt: MqttService,
    @InjectRepository(LiteSchedule, 'sqlite')
    private readonly scheduleRepo: Repository<LiteSchedule>,
  ) {}

  async getSchedules(): Promise<LiteSchedule[]> {
    return await this.scheduleRepo.find();
  }

  getHealth(deviceId?: string) {
    return {
      device: deviceId,
      on: this.health,
    };
  }

  getLatestConfig(): UpdateControlDto {
    return this.latestConfig;
  }

  async saveSchedule(deviceId: string, dto: DeviceScheduleDto): Promise<void> {
    const schedule = this.scheduleRepo.create({
      ...dto,
      deviceId,
    });
    await this.scheduleRepo.save({ ...schedule, createdAt: nowVNDate() });
  }

  async getScheduleById(
    deviceId: string,
    id: number,
  ): Promise<DeviceScheduleDto> {
    const found = await this.scheduleRepo.findOne({
      where: { id, deviceId },
    });
    if (!found) throw new NotFoundException('Schedule not found');
    return found;
  }

  async updateScheduleByDevice(
    deviceId: string,
    device: DeviceType,
    dto: UpdateScheduleDto,
  ): Promise<void> {
    const schedule = await this.scheduleRepo.findOne({
      where: { deviceId, device },
    });
    if (!schedule) throw new NotFoundException('Schedule device not found');
    await this.scheduleRepo.update(schedule.id, dto);
  }

  async updateSchedule(
    deviceId: string,
    id: number,
    dto: UpdateScheduleDto,
  ): Promise<void> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id, deviceId },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    await this.scheduleRepo.update(id, dto);
  }

  async deleteAllSchedules(): Promise<void> {
    await this.scheduleRepo.delete({
      device: In(['fanOn', 'ledOn', 'pumpOn', 'led', 'fan', 'pump']),
    });
  }

  async deleteSchedule(deviceId: string, id: number): Promise<void> {
    const found = await this.scheduleRepo.findOne({
      where: { id, deviceId },
    });
    if (!found) throw new NotFoundException('Schedule not found');
    await this.scheduleRepo.delete(id);
  }

  async applyScheduleAndUpdateConfig(deviceId: string): Promise<void> {
    const nowVN = DateTime.now().setZone('Asia/Ho_Chi_Minh');
    const nowMin = nowVN.hour * 60 + nowVN.minute;
    const today = nowVN.weekday % 7;
    const yesterday = (today + 6) % 7;

    this.health = false;

    const schedules = await this.scheduleRepo.find({ where: { deviceId } });

    const activeStates: Record<DeviceType, boolean> = {
      pump: false,
      fanVent: false,
      fanCool: false,
      led: false,
      sensors: false,
      camera: false,
    };

    const isTimeInRange = (start: string, end: string): boolean => {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      if ([sh, sm, eh, em].some(Number.isNaN)) return false;

      const s = sh * 60 + sm;
      const e = eh * 60 + em;

      return s <= e ? nowMin >= s && nowMin < e : nowMin >= s || nowMin < e;
    };

    for (const schedule of schedules) {
      if (!schedule.isEnabled) continue;

      const repeatDays = (schedule.repeatOn as (string | number)[]).map(Number);
      const key = schedule.device;
      if (!(key in activeStates)) {
        console.warn(
          `[WARN] Invalid device type in schedule ID ${schedule.id}: ${schedule.device}`,
        );
        continue;
      }

      for (const time of schedule.times) {
        const [sh, sm] = time.start.split(':').map(Number);
        const [eh, em] = time.end.split(':').map(Number);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;

        const validDay =
          start <= end
            ? repeatDays.includes(today)
            : repeatDays.includes(today) ||
              (nowMin < end && repeatDays.includes(yesterday));

        if (!validDay) continue;

        if (isTimeInRange(time.start, time.end)) {
          activeStates[key] = true;
          break;
        }
      }
    }

    this.latestConfig = activeStates;

    const currentTime = nowVN.toFormat('HH:mm');
    const allOff = Object.values(activeStates).every((v) => !v);

    if (allOff) {
      console.log(`[SKIP] ${deviceId} - ${currentTime} → no devices ON`);
    } else {
      console.log(`[UPDATE] ${deviceId} - ${currentTime} →`, activeStates);
    }

    if (nowVN.hour >= 4 && nowVN.hour < 22) {
      this.mqtt.updateControl();
    }
  }

  async getScheduleByDevice(deviceId: string): Promise<LiteSchedule[]> {
    return this.scheduleRepo.find({
      where: { deviceId },
    });
  }
}

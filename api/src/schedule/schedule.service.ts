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
import { Repository } from 'typeorm';
import { LiteSchedule } from '../sqlite/lite-schedule.entity';

@Injectable()
export class ScheduleService {
  public health: boolean = false;
  private latestConfig: UpdateControlDto = {
    pumpOn: false,
    ledOn: false,
    fanOn: false,
    sensor: false,
    camera: false,
  };

  constructor(
    @Inject(forwardRef(() => MqttService))
    private readonly mqtt: MqttService,
    @InjectRepository(LiteSchedule, 'sqlite')
    private readonly scheduleRepo: Repository<LiteSchedule>,
  ) { }

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

    await this.scheduleRepo.save(schedule);
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
    this.health = false;

    const schedules = await this.scheduleRepo.find({ where: { deviceId } });
    if (!schedules.length) {
      console.warn(`[WARN] No schedules for ${deviceId}`);
      return;
    }
    console.log("schedules===>:", schedules)
    const activeStates = {
      pumpOn: false,
      ledOn: false,
      fanOn: false,
      sensor: false,
      camera: false,
    };

    for (const schedule of schedules) {
      if (!schedule.isEnabled) continue;
      const repeatDays: number[] = (schedule.repeatOn as unknown as (string | number)[]).map(Number);
  if (!repeatDays.includes(today)) continue;

      for (const time of schedule.times) {
        const [sh, sm] = time.start.split(':').map(Number);
        const [eh, em] = time.end.split(':').map(Number);

        if (
          [sh, sm, eh, em].some((n) => Number.isNaN(n)) ||
          sh < 0 || sh > 23 || sm < 0 || sm > 59 ||
          eh < 0 || eh > 23 || em < 0 || em > 59
        ) {
          console.warn(`[WARN] Invalid time format in schedule ID ${schedule.id}`);
          continue;
        }

        const start = sh * 60 + sm;
        const end = eh * 60 + em;

        const isActive =
          start <= end
            ? nowMin >= start && nowMin < end
            : nowMin >= start || nowMin < end;

        if (isActive) {
          activeStates[schedule.device] = true;
          break; // Đã tìm thấy 1 khoảng thời gian hợp lệ → không cần kiểm tra tiếp
        }
      }
    }

    const allOff = Object.values(activeStates).every((v) => !v);
    const currentTime = nowVN.toFormat('HH:mm');

    if (allOff) {
      console.log(`[SKIP] ${deviceId} - ${currentTime} → no devices ON`);
      return;
    }

    // const prev = this.latestConfig;
    // const isChanged = !prev || Object.keys(activeStates).some((key) => activeStates[key] !== prev[key]);

    // if (!isChanged) {
    //   console.log(`[SKIP] ${deviceId} - ${currentTime} → unchanged config`);
    //   return;
    // }

    this.latestConfig = activeStates;

    console.log(`[UPDATE] ${deviceId} - ${currentTime} →`, activeStates);

    // Gửi lệnh điều khiển chỉ trong khung giờ hợp lệ
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

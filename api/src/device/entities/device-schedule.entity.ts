// src/device/entities/device-schedule.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('device_schedules')
export class DeviceScheduleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deviceId: string;

  @Column({ default: false })
  pumpOn: boolean;

  @Column({ default: false })
  fanOn: boolean;

  @Column({ default: false })
  ledOn: boolean;

  @Column()
  startTime: string; // "HH:mm"

  @Column()
  endTime: string; // "HH:mm"

  @Column({ default: true })
  repeatDaily: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

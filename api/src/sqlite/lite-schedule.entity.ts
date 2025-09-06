import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum DeviceType {
  PUMP = 'pump',
  FAN_VENT = 'fanVent',
  FAN_COOL = 'fanCool',
  LED = 'led',
  SENSORS = 'sensors',
  CAMERA = 'camera',
}

@Entity()
export class LiteSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deviceId: string;

  @Column()
  device: 'pump' | 'fanCool' | 'fanVent' | 'led' | 'sensors' | 'camera';

  @Column('simple-json')
  times: { start: string; end: string }[];

  @Column('simple-array')
  repeatOn: number[];

  @Column({ default: true })
  isEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

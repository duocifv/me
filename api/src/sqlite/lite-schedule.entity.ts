import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum DeviceType {
  PUMP = 'pumpOn',
  FAN = 'fanOn',
  LED = 'ledOn',
  SENSOR = 'sensor',
  CAMERA = 'camera',
}

@Entity()
export class LiteSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deviceId: string;

  @Column()
  device: 'pumpOn' | 'fanOn' | 'ledOn' | 'sensor' | 'camera';

  @Column('simple-json')
  times: { start: string; end: string }[];

  @Column('simple-array')
  repeatOn: number[];

  @Column({ default: true })
  isEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class LiteSensors {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  waterTemperature: number;

  @Column('float')
  ambientTemperature: number;

  @Column('float')
  humidity: number;

  @CreateDateColumn()
  createdAt: Date;
}

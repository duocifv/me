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
  waterTemp: number;

  @Column('float')
  airTemp: number;

  @Column('float')
  humidity: number;

  @CreateDateColumn()
  createdAt: Date;
}

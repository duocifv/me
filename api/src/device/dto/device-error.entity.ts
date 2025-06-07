import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'device_errors' })
export class DeviceErrorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'device_id', type: 'varchar', length: 100 })
  deviceId: string;

  @Column({ name: 'device_token', type: 'varchar', length: 255 })
  deviceToken: string;

  @Column({ name: 'error_code', type: 'varchar', length: 100 })
  errorCode: string;

  @Column({ name: 'error_message', type: 'text' })
  errorMessage: string;

  @Column({ name: 'reported_at', type: 'timestamptz', nullable: true })
  reportedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

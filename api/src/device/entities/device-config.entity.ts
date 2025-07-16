// src/device-config/device-config.entity.ts
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'device_config' })
export class DeviceConfigEntity {
  @PrimaryColumn({ name: 'device_id', type: 'varchar', length: 32 })
  deviceId: string;

  @PrimaryColumn({ name: 'version', type: 'int' })
  version: number;

  // ====== SERVER ======
  @Column({ name: 'host', type: 'varchar', length: 128 })
  host: string;

  @Column({ name: 'port', type: 'int' })
  port: number;

  @Column({ name: 'sensor_endpoint', type: 'varchar', length: 128 })
  sensorEndpoint: string;

  @Column({ name: 'camera_endpoint', type: 'varchar', length: 128 })
  cameraEndpoint: string;

  // ====== INTERVALS ======
  @Column({ name: 'data_interval', type: 'int', default: 30000 }) // ms
  dataInterval: number;

  @Column({ name: 'image_interval', type: 'int', default: 20000 }) // ms
  imageInterval: number;

  // ====== DEVICES ======
  @Column({ name: 'enable_pump', type: 'boolean', default: true })
  pumpOn: boolean;

  @Column({ name: 'enable_led', type: 'boolean', default: true })
  ledOn: boolean;

  @Column({ name: 'enable_fan', type: 'boolean', default: true })
  fanOn: boolean;

  // ====== Timestamps ======
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}

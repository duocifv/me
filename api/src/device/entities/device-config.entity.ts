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

  @Column({ name: 'wifi_ssid', type: 'varchar', length: 64 })
  wifiSsid: string;

  @Column({ name: 'wifi_password', type: 'varchar', length: 64 })
  wifiPassword: string;

  @Column({ name: 'host', type: 'varchar', length: 128, default: '' })
  host: string;

  @Column({ name: 'port', type: 'int', default: 0 })
  port: number;

  @Column({ name: 'deep_sleep_interval_us', type: 'int', default: 0 })
  deepSleepIntervalUs: number;

  @Column({ name: 'sensor_endpoint', type: 'varchar', length: 128 })
  sensorEndpoint: string;

  @Column({ name: 'camera_endpoint', type: 'varchar', length: 128 })
  cameraEndpoint: string;

  @Column({ name: 'sensor_interval', type: 'int', default: 0 })
  sensorInterval: number;

  @Column({ name: 'data_interval', type: 'int', default: 0 })
  dataInterval: number;

  @Column({ name: 'image_interval', type: 'int', default: 0 })
  imageInterval: number;

  @Column({ name: 'pump_cycle_ms', type: 'int', default: 0 })
  pumpCycleMs: number;

  @Column({ name: 'pump_on_ms', type: 'int', default: 0 })
  pumpOnMs: number;

  @Column({ name: 'pump_off_ms', type: 'int', default: 0 })
  pumpOffMs: number;

  @Column({ name: 'pump_start_hour', type: 'int', default: 6 })
  pumpStartHour: number;

  @Column({ name: 'pump_end_hour', type: 'int', default: 18 })
  pumpEndHour: number;

  @Column({ name: 'led_cycle_ms', type: 'int', default: 0 })
  ledCycleMs: number;

  @Column({ name: 'led_on_ms', type: 'int', default: 0 })
  ledOnMs: number;

  @Column({ name: 'led_off_ms', type: 'int', default: 0 })
  ledOffMs: number;

  @Column({ name: 'led_start_hour', type: 'int', default: 6 })
  ledStartHour: number;

  @Column({ name: 'led_end_hour', type: 'int', default: 18 })
  ledEndHour: number;

  @Column({ name: 'fan_small_on_ms', type: 'int', default: 0 })
  fanSmallOnMs: number;

  @Column({ name: 'fan_small_off_ms', type: 'int', default: 0 })
  fanSmallOffMs: number;

  @Column({ name: 'fan_large_continuous', type: 'boolean', default: true })
  fanLargeContinuous: boolean;

  @Column({ name: 'fan_large_on_ms', type: 'int', default: 0 })
  fanLargeOnMs: number;

  @Column({ name: 'fan_large_off_ms', type: 'int', default: 0 })
  fanLargeOffMs: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}

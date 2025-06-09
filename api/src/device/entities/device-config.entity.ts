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
  // Khóa chính: device_id
  @PrimaryColumn({ name: 'device_id', type: 'varchar', length: 32 })
  deviceId: string;

  // Thông tin Wi-Fi
  @Column({ name: 'wifi_ssid', type: 'varchar', length: 64 })
  wifiSsid: string;

  @Column({ name: 'wifi_password', type: 'varchar', length: 64 })
  wifiPassword: string;

  // Host và port của API backend
  @Column({ name: 'host', type: 'varchar', length: 128, default: '' })
  host: string;

  @Column({ name: 'port', type: 'int', default: 0 })
  port: number;

  // Thời gian deep sleep (microseconds)
  @Column({ name: 'deep_sleep_interval_us', type: 'bigint' })
  deepSleepIntervalUs: number;

  // Thời gian bơm bật (milliseconds)
  @Column({ name: 'pump_on_time_ms', type: 'int' })
  pumpOnTimeMs: number;

  // Đường dẫn endpoint gửi dữ liệu sensor
  @Column({ name: 'sensor_endpoint', type: 'varchar', length: 128 })
  sensorEndpoint: string;

  // Đường dẫn endpoint gửi ảnh
  @Column({ name: 'camera_endpoint', type: 'varchar', length: 128 })
  cameraEndpoint: string;

  // Khoảng thời gian giữa hai lần đọc sensor
  @Column({ name: 'sensor_interval', type: 'int', default: 0 })
  sensorInterval: number;

  // Khoảng thời gian giữa hai lần gửi dữ liệu
  @Column({ name: 'data_interval', type: 'int', default: 0 })
  dataInterval: number;

  // Khoảng thời gian giữa hai lần gửi ảnh
  @Column({ name: 'image_interval', type: 'int', default: 0 })
  imageInterval: number;

  // Khoảng thời gian giữa hai chu kỳ bơm (OFF→ON)
  @Column({ name: 'pump_cycle_ms', type: 'int', default: 0 })
  pumpCycleMs: number;

  // Thời gian bơm bật trong mỗi chu kỳ (thường trùng với pumpOnTimeMs)
  @Column({ name: 'pump_on_ms', type: 'int', default: 0 })
  pumpOnMs: number;

  // Timestamps tự động ghi nhận khi bản ghi được tạo/cập nhật
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}

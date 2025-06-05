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

  // Device token để xác thực API
  @Column({ name: 'device_token', type: 'varchar', length: 64 })
  deviceToken: string;

  // --- Các khoảng thời gian động (milliseconds) trả về từ server ---

  // Khoảng thời gian giữa hai lần đọc sensor
  @Column({ name: 'SENSOR_INTERVAL', type: 'int', default: 0 })
  sensorInterval: number;

  // Khoảng thời gian giữa hai lần gửi dữ liệu
  @Column({ name: 'DATA_INTERVAL', type: 'int', default: 0 })
  dataInterval: number;

  // Khoảng thời gian giữa hai lần gửi ảnh
  @Column({ name: 'IMAGE_INTERVAL', type: 'int', default: 0 })
  imageInterval: number;

  // Khoảng thời gian giữa hai chu kỳ bơm (OFF→ON)
  @Column({ name: 'PUMP_CYCLE_MS', type: 'int', default: 0 })
  pumpCycleMs: number;

  // Thời gian bơm bật trong mỗi chu kỳ (thường trùng với pumpOnTimeMs)
  @Column({ name: 'PUMP_ON_MS', type: 'int', default: 0 })
  pumpOnMs: number;

  // Timestamps tự động ghi nhận khi bản ghi được tạo/cập nhật
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}

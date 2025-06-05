// src/device-config/dto/create-device-config.dto.ts
import { IsString, IsNumber } from 'class-validator';

export class CreateDeviceConfigDto {
  @IsString()
  device_id: string;

  @IsString()
  wifi_ssid: string;

  @IsString()
  wifi_password: string;

  @IsNumber()
  deep_sleep_interval_us: number;

  @IsNumber()
  pump_on_time_ms: number;

  @IsString()
  sensor_endpoint: string;

  @IsString()
  camera_endpoint: string;

  @IsString()
  device_token: string;

  @IsNumber()
  sensorInterval: number;

  @IsNumber()
  dataInterval: number;

  @IsNumber()
  imageInterval: number;

  @IsNumber()
  pumpCycleMs: number;

  @IsNumber()
  pumpOnMs: number;
}

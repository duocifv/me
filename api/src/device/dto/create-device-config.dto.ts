// src/device-config/dto/create-device-config.dto.ts
import { IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeviceConfigDto {
  @IsString()
  deviceId: string;

  @IsString()
  wifiSsid: string;

  @IsString()
  wifiPassword: string;

  @Type(() => Number)
  @IsInt()
  deepSleepIntervalUs: number;

  @Type(() => Number)
  @IsInt()
  pumpOnTimeMs: number;

  @IsString()
  sensorEndpoint: string;

  @IsString()
  cameraEndpoint: string;

  @IsString()
  deviceToken: string;

  @Type(() => Number)
  @IsInt()
  sensorInterval: number;

  @Type(() => Number)
  @IsInt()
  dataInterval: number;

  @Type(() => Number)
  @IsInt()
  imageInterval: number;

  @Type(() => Number)
  @IsInt()
  pumpCycleMs: number;

  @Type(() => Number)
  @IsInt()
  pumpOnMs: number;
}

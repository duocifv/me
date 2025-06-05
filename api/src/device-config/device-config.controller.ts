// src/device-config/device-config.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DeviceConfigService } from './device-config.service';
import { CreateDeviceConfigDto } from './dto/create-device-config.dto';
import { DeviceConfigEntity } from './device-config.entity';

@Controller('device-config')
export class DeviceConfigController {
  constructor(private readonly configService: DeviceConfigService) {}

  /**
   * GET /device-config?device_id=xxx&device_token=yyy
   */
  @Get()
  async getConfig(
    @Query('device_id') device_id: string,
    @Query('device_token') device_token: string,
  ): Promise<Partial<DeviceConfigEntity>> {
    const cfg = await this.configService.getConfig(device_id);

    return {
      device_id: cfg.device_id,
      wifi_ssid: cfg.wifi_ssid,
      wifi_password: cfg.wifi_password,
      deep_sleep_interval_us: cfg.deep_sleep_interval_us,
      pump_on_time_ms: cfg.pump_on_time_ms,
      sensor_endpoint: cfg.sensor_endpoint,
      camera_endpoint: cfg.camera_endpoint,
      device_token: cfg.device_token,

      // Thêm các field mới
      sensorInterval: cfg.sensorInterval,
      dataInterval: cfg.dataInterval,
      imageInterval: cfg.imageInterval,
      pumpCycleMs: cfg.pumpCycleMs,
      pumpOnMs: cfg.pumpOnMs,
    };
  }

  /**
   * POST /device-config
   */
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createOrUpdate(
    @Body() createDto: CreateDeviceConfigDto,
  ): Promise<Partial<DeviceConfigEntity>> {
    const cfg = await this.configService.createOrUpdateConfig(createDto);
    return {
      device_id: cfg.device_id,
      wifi_ssid: cfg.wifi_ssid,
      wifi_password: cfg.wifi_password,
      deep_sleep_interval_us: cfg.deep_sleep_interval_us,
      pump_on_time_ms: cfg.pump_on_time_ms,
      sensor_endpoint: cfg.sensor_endpoint,
      camera_endpoint: cfg.camera_endpoint,
      device_token: cfg.device_token,

      // Trả về các trường mới
      sensorInterval: cfg.sensorInterval,
      dataInterval: cfg.dataInterval,
      imageInterval: cfg.imageInterval,
      pumpCycleMs: cfg.pumpCycleMs,
      pumpOnMs: cfg.pumpOnMs,
    };
  }
}

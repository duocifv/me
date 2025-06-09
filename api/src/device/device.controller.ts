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
import { DeviceConfigService } from './device.service';
import { CreateDeviceConfigDto } from './dto/create-device-config.dto';
import { ReportDeviceErrorDto } from './dto/report-device-error.dto';
import { DeviceConfigEntity } from './entities/device-config.entity';

@Controller('device')
export class DeviceController {
  constructor(private readonly configService: DeviceConfigService) {}

  @Post('error')
  async reportError(@Body() dto: ReportDeviceErrorDto): Promise<void> {
    await this.configService.reportDeviceError(dto);
  }

  /**
   * GET /device-config?device_id=xxx&device_token=yyy
   */
  @Get('config')
  async getConfig(
    @Query('device_id') device_id: string,
    @Query('device_token') device_token: string,
  ): Promise<Partial<DeviceConfigEntity>> {
    const cfg = await this.configService.getConfig(device_id);

    return {
      deviceId: cfg.deviceId,
      wifiSsid: cfg.wifiSsid,
      wifiPassword: cfg.wifiPassword,
      deepSleepIntervalUs: cfg.deepSleepIntervalUs,
      pumpOnTimeMs: cfg.pumpOnTimeMs,
      sensorEndpoint: cfg.sensorEndpoint,
      cameraEndpoint: cfg.cameraEndpoint,
      deviceToken: cfg.deviceToken,
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
  @Post('config')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createOrUpdate(
    @Body() createDto: CreateDeviceConfigDto,
  ): Promise<Partial<DeviceConfigEntity>> {
    const cfg = await this.configService.createOrUpdateConfig(createDto);
    return {
      deviceId: cfg.deviceId,
      wifiSsid: cfg.wifiSsid,
      wifiPassword: cfg.wifiPassword,
      deepSleepIntervalUs: cfg.deepSleepIntervalUs,
      pumpOnTimeMs: cfg.pumpOnTimeMs,
      sensorEndpoint: cfg.sensorEndpoint,
      cameraEndpoint: cfg.cameraEndpoint,
      deviceToken: cfg.deviceToken,
      sensorInterval: cfg.sensorInterval,
      dataInterval: cfg.dataInterval,
      imageInterval: cfg.imageInterval,
      pumpCycleMs: cfg.pumpCycleMs,
      pumpOnMs: cfg.pumpOnMs,
    };
  }
}

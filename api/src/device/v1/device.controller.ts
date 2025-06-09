// src/device-config/device-config.controller.ts
import { Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import {
  CreateDeviceConfigDto,
  CreateDeviceConfigSchema,
} from '../dto/create-device-config.dto';
import {
  ReportDeviceErrorDto,
  ReportDeviceErrorSchema,
} from '../dto/report-device-error.dto';
import { DeviceConfigEntity } from '../entities/device-config.entity';
import { DeviceAuth } from 'src/shared/decorators/device-token.decorator';
import { BodySchema } from 'src/shared/decorators/body-schema.decorator';
import { DeviceErrorEntity } from '../entities/device-error.entity';
import { DeviceService } from './device.service';

@Controller('device')
export class DeviceController {
  constructor(private readonly configService: DeviceService) {}

  @Post('error')
  @DeviceAuth()
  @HttpCode(201)
  async reportError(
    @BodySchema(ReportDeviceErrorSchema) dto: ReportDeviceErrorDto,
    @Req() req,
  ) {
    return this.configService.reportDeviceError(dto, req.deviceId);
  }

  /**
   * POST /device-config
   */
  @Post('config')
  @DeviceAuth()
  async createOrUpdate(
    @BodySchema(CreateDeviceConfigSchema) createDto: CreateDeviceConfigDto,
  ): Promise<Partial<DeviceConfigEntity>> {
    return this.configService.createOrUpdateConfig(createDto);
  }

  /**
   * GET /device-config?device_id=xxx&device_token=yyy
   */
  @Get('config')
  @DeviceAuth()
  async getConfig(@Req() req): Promise<Partial<DeviceConfigEntity>> {
    return this.configService.getConfig(req.deviceId);
  }

  @Get('error')
  @DeviceAuth()
  async getErrors(@Req() req): Promise<DeviceErrorEntity[]> {
    return this.configService.getDeviceErrors(req.deviceId);
  }
}

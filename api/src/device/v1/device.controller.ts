// src/device-config/device-config.controller.ts
import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import {
  CreateDeviceConfigDto,
  CreateDeviceConfigSchema,
} from '../dto/create-device-config.dto';
import {
  ReportDeviceErrorDto,
  ReportDeviceErrorSchema,
} from '../dto/report-device-error.dto';
import { DeviceConfigEntity } from '../entities/device-config.entity';
import { DeviceErrorEntity } from '../entities/device-error.entity';
import { DeviceAuth } from 'src/shared/decorators/device-token.decorator';
import { BodySchema } from 'src/shared/decorators/body-schema.decorator';
import { DeviceService } from './device.service';
import { ApiParam } from '@nestjs/swagger';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  /** Upsert config với version tự động tăng */
  @Post('config')
  @HttpCode(200)
  async upsertConfig(
    @BodySchema(CreateDeviceConfigSchema) dto: CreateDeviceConfigDto,
  ): Promise<DeviceConfigEntity> {
    return this.deviceService.upsertWithVersion(dto);
  }

  /** Lấy config mới nhất cho device */
  @Get('config')
  @DeviceAuth()
  async getConfig(@Req() req): Promise<DeviceConfigEntity> {
    return this.deviceService.getLatestConfig(req.deviceId);
  }

  /** Lấy config mới nhất theo deviceId (admin) */
  @Get('config/:deviceId')
  @ApiParam({
    name: 'deviceId',
    example: 'device-001',
  })
  async getConfigForAdmin(
    @Param('deviceId') deviceId: string,
  ): Promise<DeviceConfigEntity> {
    return this.deviceService.getLatestConfigbyDevice(deviceId);
  }

  /** Danh sách version */
  @Get('config/:deviceId/versions')
  @ApiParam({
    name: 'deviceId',
    example: 'device-001',
  })
  async listVersions(
    @Param('deviceId') deviceId: string,
  ): Promise<{ version: number; createdAt: Date }[]> {
    return this.deviceService.listConfigVersions(deviceId);
  }

  /** Rollback về version cụ thể */
  @Post('config/:deviceId/rollback/:version')
  @ApiParam({
    name: 'deviceId',
    example: 'device-001',
  })
  @HttpCode(200)
  async rollback(
    @Param('deviceId') deviceId: string,
    @Param('version', ParseIntPipe) version: number,
  ): Promise<DeviceConfigEntity> {
    return this.deviceService.rollbackConfig(deviceId, version);
  }

  /** Lấy lỗi của thiết bị */
  @Get('error')
  @DeviceAuth()
  async getErrors(@Req() req): Promise<DeviceErrorEntity[]> {
    return this.deviceService.getDeviceErrors(req.deviceId);
  }

  /** Lấy config mới nhất theo deviceId (admin) */
  @Get('error/:deviceId')
  @ApiParam({
    name: 'deviceId',
    example: 'device-001',
  })
  async getErrorsForAdmin(
    @Param('deviceId') deviceId: string,
  ): Promise<DeviceErrorEntity[]> {
    return this.deviceService.getDeviceErrors(deviceId);
  }

  /** Thiết bị báo lỗi */
  @Post('error')
  @DeviceAuth()
  @HttpCode(201)
  async reportError(
    @BodySchema(ReportDeviceErrorSchema) dto: ReportDeviceErrorDto,
    @Req() req,
  ): Promise<{ success: true }> {
    return this.deviceService.reportDeviceError(req.deviceId, dto);
  }
}

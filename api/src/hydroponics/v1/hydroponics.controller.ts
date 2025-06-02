import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Param,
  BadRequestException,
  NotFoundException,
  Body,
  Query,
} from '@nestjs/common';
import { HydroponicsService } from './hydroponics.service';
import { BodySchema } from 'src/shared/decorators/body-schema.decorator';
import {
  CreateCropInstanceDto,
  CreateCropInstanceSchema,
} from '../dto/create-crop-instance.dto';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { UploadFileDto } from '../dto/upload-file.dto';
import { DeviceAuth } from 'src/shared/decorators/device-token.decorator';
import { ApiCreateSnapshot } from '../type/snapshot.swagger';

@Controller('hydroponics')
export class HydroponicsController {
  constructor(private readonly service: HydroponicsService) {}

  /**
   * Tạo crop instance mới → tự động đánh dấu active
   */
  @Post('crop-instances')
  @DeviceAuth()
  createCrop(
    @BodySchema(CreateCropInstanceSchema) dto: CreateCropInstanceDto,
    @Request() req,
  ) {
    return this.service.createCropInstance(req.deviceId, dto);
  }

  /**
   * Lấy tất cả crop instances của device
   */
  @Get('crop-instances')
  getCrops(@Request() req) {
    return this.service.getCropInstances(req.deviceId);
  }

  /**
   * Tạo snapshot mới cho crop active (deviceId → crop active → snapshot)
   */
  @Post('snapshots')
  @DeviceAuth()
  @ApiCreateSnapshot()
  createSnapshot(@Request() req, @Body() body: any) {
    const { sensorData, solutionData } = body;

    if (
      typeof sensorData !== 'object' ||
      sensorData === null ||
      typeof solutionData !== 'object' ||
      solutionData === null
    ) {
      throw new BadRequestException('Invalid sensor or solution data');
    }

    const validSensors = [
      'water_temperature',
      'ambient_temperature',
      'humidity',
      // 'light_intensity', // nếu cần thì mở lại
    ];

    for (const key of Object.keys(sensorData)) {
      if (!validSensors.includes(key)) {
        throw new BadRequestException(`Invalid sensor key: ${key}`);
      }
      if (typeof sensorData[key] !== 'number') {
        throw new BadRequestException(`Sensor ${key} must be a number`);
      }
    }

    const validSolutionKeys = ['ph', 'ec', 'orp'];
    for (const key of Object.keys(solutionData)) {
      if (!validSolutionKeys.includes(key)) {
        throw new BadRequestException(`Invalid solution key: ${key}`);
      }
      if (typeof solutionData[key] !== 'number') {
        throw new BadRequestException(`Solution ${key} must be a number`);
      }
    }

    // Gọi async service, không đợi kết quả
    setImmediate(() => this.service.createSnapshot(req.deviceId, body));

    return { success: true };
  }

  /**
   * Lấy tất cả snapshots của crop active
   */

  @Get('snapshots/by-device')
  async getSnapshots(@Query('id') deviceId: string) {
    if (!deviceId) {
      throw new BadRequestException('Thiếu deviceId trong request');
    }
    return this.service.getSnapshotsByDevice(deviceId);
  }

  /**
   * Lấy thông tin snapshot cụ thể (chỉ khi cần tra cứu riêng)
   */
  @Get('snapshots/:snapshotId')
  getSnapshot(@Param('snapshotId') snapshotId: number) {
    return this.service.getSnapshotById(snapshotId);
  }

  /**
   * Upload ảnh cho snapshot mới nhất (crop active + snapshot active)
   */
  @ApiOperation({ summary: 'Upload ảnh cho snapshot mới nhất' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @Post('snapshots/images')
  @DeviceAuth()
  async uploadLatestSnapshotImage(
    @Request() req,
    @Request() fastifyReq: FastifyRequest,
  ) {
    if (!fastifyReq.isMultipart()) {
      throw new BadRequestException('Form must be multipart/form-data');
    }

    const part = await fastifyReq.file();
    if (!part) {
      throw new NotFoundException('Không tìm thấy file upload');
    }
    if (!['image/jpeg', 'image/png'].includes(part.mimetype)) {
      throw new BadRequestException('Chỉ chấp nhận JPG hoặc PNG');
    }

    const { url } = await fastifyReq.server.fileManager.saveEsp32Image(part);
    return this.service.addImageToLatestSnapshot(req.deviceId, url);
  }
}

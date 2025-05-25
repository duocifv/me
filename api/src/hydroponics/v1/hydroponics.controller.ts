import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Param,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { HydroponicsService } from './hydroponics.service';
import { BodySchema } from 'src/shared/decorators/body-schema.decorator';
import {
  CreateCropInstanceDto,
  CreateCropInstanceSchema,
} from '../dto/create-crop-instance.dto';
import {
  CreateSnapshotDto,
  CreateSnapshotSchema,
} from '../dto/create-snapshot.dto';
import { DeviceTokenGuard } from '../guard/device-token.guard';
import { Public } from 'src/shared/decorators/public.decorator';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { UploadFileDto } from '../dto/upload-file.dto';
import { DeviceToken } from 'src/shared/decorators/device-token.decorator';

@Public()
@DeviceToken()
@UseGuards(DeviceTokenGuard)
@Controller('hydroponics')
export class HydroponicsController {
  constructor(private readonly service: HydroponicsService) {}

  /**
   * Tạo crop instance mới → tự động đánh dấu active
   */
  @Post('crop-instances')
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
  createSnapshot(
    @Request() req,
    @BodySchema(CreateSnapshotSchema) dto: CreateSnapshotDto,
  ) {
    return this.service.createSnapshot(req.deviceId, dto);
  }

  /**
   * Lấy tất cả snapshots của crop active
   */
  @Get('snapshots')
  getSnapshots(@Request() req) {
    return this.service.getSnapshotsByDevice(req.deviceId);
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

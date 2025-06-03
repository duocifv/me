// src/controllers/hydroponics.controller.ts
import {
  Controller,
  Get,
  Post,
  Request,
  Param,
  BadRequestException,
  NotFoundException,
  Res,
  Body,
  Req,
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
import { CreateCameraImageDto } from '../dto/create-camera-image.dto';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { UploadFileDto } from '../dto/upload-file.dto';
import { DeviceAuth } from 'src/shared/decorators/device-token.decorator';
import { QuerySchema } from 'src/shared/decorators/query-schema.decorator';
import { GetSnapshotsDto, GetSnapshotsSchema } from '../dto/get-snapshots.dto';
import path, { join, normalize, resolve } from 'path';
import { PermissionName } from 'src/permissions/dto/permission.enum';
import { Permissions } from 'src/permissions/permissions.decorator';
import { existsSync } from 'fs';

@Controller('hydroponics')
export class HydroponicsController {
  constructor(private readonly service: HydroponicsService) {}

  /**
   * Tạo crop instance mới → tự động đánh dấu active
   */
  @Post('crop-instances')
  createCrop(@BodySchema(CreateCropInstanceSchema) dto: CreateCropInstanceDto) {
    return this.service.createCropInstance('device-001', dto);
  }

  /**
   * Lấy tất cả crop instances của device
   */
  @Get('crop-instances')
  getCrops() {
    return this.service.getCropInstances('device-001'); //Tạm thời chưa bổ sung csdl và thiết bị
  }

  /**
   * Tạo snapshot mới cho crop active (deviceId → crop active → snapshot)
   */
  @Post('snapshots')
  @DeviceAuth()
  createSnapshot(
    @BodySchema(CreateSnapshotSchema) dto: CreateSnapshotDto,
    @Req() req,
  ) {
      this.service.createSnapshot(req.deviceId, dto).catch((err) => {
      // Ghi log lỗi nếu có
      console.error('Error when saving snapshot (fire-and-forget):', err);
    });

    return { success: true };
  }

  /**
   * Lấy tất cả snapshots (metadata + images) của crop active (phân trang)
   */
  @Get('snapshots/by-device')
  async getSnapshots(@QuerySchema(GetSnapshotsSchema) dto: GetSnapshotsDto) {
    return this.service.getSnapshotsByDevice(dto);
  }

  /**
   * Lấy thông tin snapshot cụ thể (chỉ metadata + images)
   */
  @Get('snapshots/:snapshotId')
  getSnapshot(@Param('snapshotId') snapshotId: number) {
    return this.service.getSnapshotById(snapshotId);
  }

  /**
   * Lấy tất cả SensorReading của một snapshot
   */
  @Get('snapshots/:snapshotId/readings/sensor')
  getSensorReadings(@Param('snapshotId') snapshotId: number) {
    return this.service.getSensorReadingsBySnapshot(snapshotId);
  }

  /**
   * Lấy tất cả SolutionReading của một snapshot
   */
  @Get('snapshots/:snapshotId/readings/solution')
  getSolutionReadings(@Param('snapshotId') snapshotId: number) {
    return this.service.getSolutionReadingsBySnapshot(snapshotId);
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

    // Lưu ảnh (ví dụ với fileManager của Fastify plugin)
    const { url, size, filename } =
      await fastifyReq.server.fileManager.saveEsp32Image(part);
    // Tạo DTO cho CameraImage
    const imageDto: CreateCameraImageDto = {
      filename,
      url,
      mimetype: part.mimetype,
      size: size ?? null,
    };

    return this.service.addImageToLatestSnapshot(req.deviceId, imageDto);
  }

  @Get('/image/:filename')
  getImage(@Param('filename') filename: string, @Res() res: FastifyReply) {
    const esp32Folder = resolve('uploads/esp32');
    const filePath = normalize(join(esp32Folder, filename));

    console.log('filePath', filePath);

    // Ngăn path traversal
    if (!filePath.startsWith(esp32Folder + path.sep)) {
      throw new BadRequestException('Invalid filename');
    }

    // Kiểm tra file có tồn tại không
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    // Trả về file từ path tương đối (relative) từ thư mục 'uploads'
    const relativePath = join('esp32', filename);
    return res.sendFile(relativePath);
  }
}

import {
  Controller,
  Get,
  Post,
  Request,
  Param,
  BadRequestException,
  NotFoundException,
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
import { FastifyRequest } from 'fastify';
import { UploadFileDto } from '../dto/upload-file.dto';
import { DeviceAuth } from 'src/shared/decorators/device-token.decorator';
import { QuerySchema } from 'src/shared/decorators/query-schema.decorator';
import { GetSnapshotsDto, GetSnapshotsSchema } from '../dto/get-snapshots.dto';
import { Logger } from '@nestjs/common';

@Controller('hydroponics')
export class HydroponicsController {
  private readonly logger = new Logger(HydroponicsController.name);
  constructor(private readonly service: HydroponicsService) {}

  /**
   * Tạo crop instance mới → tự động đánh dấu active
   */
  @Post('crop-instances')
  createCrop(@BodySchema(CreateCropInstanceSchema) dto: CreateCropInstanceDto) {
    return this.service.createCropInstance('device-001', dto); // TODO: thay bằng @DeviceAuth nếu cần thiết
  }

  /**
   * Lấy tất cả crop instances của device
   */
  @Get('crop-instances')
  getCrops() {
    return this.service.getCropInstances('device-001'); // TODO: thay bằng @DeviceAuth nếu cần thiết
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
    setImmediate(() => {
      this.service
        .createSnapshot(req.deviceId, dto)
        .catch((err) =>
          this.logger.error('Lỗi xử lý snapshot async:', err?.message ?? err),
        );
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
   * Lấy quyết định AI của một snapshot
   */
  @Get('snapshots/:snapshotId/decision')
  async getDecision(@Param('snapshotId') snapshotId: number) {
    const snapshot = await this.service.getSnapshotById(snapshotId);
    if (!snapshot) {
      throw new NotFoundException('Snapshot không tồn tại');
    }

    const decision = await this.service.getDecisionBySnapshotId(snapshotId);
    if (!decision) {
      throw new NotFoundException('Chưa có kết quả AI cho snapshot này');
    }

    return decision;
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

    const { size, filename } =
      await fastifyReq.server.fileManager.saveEsp32Image(part);

    const imageDto: CreateCameraImageDto = {
      filePath: filename,
      size: size ?? 0,
    };

    // Trả về trước
    setImmediate(() => {
      this.service
        .addImageToLatestSnapshot(req.deviceId, imageDto)
        .catch((err) => this.logger.error('Lỗi xử lý ảnh async:', err));
    });

    return { success: true };
  }
}

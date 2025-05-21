import {
  Controller,
  Post,
  Req,
  Res,
  Param,
  Get,
  Delete,
  HttpCode,
  NotFoundException,
  Put,
  Body,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { UploadFileDto } from './dto/upload-file.dto';
import { PermissionName } from 'src/permissions/permission.enum';
import { Permissions } from 'src/permissions/permissions.decorator';
import { UploadFileService } from './media.service';
import { MediaFile } from './entities/file.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { QuerySchema } from 'src/shared/decorators/query-schema.decorator';
import { MediaDto, MediaSchema } from './dto/media.dto';
import { MediaFilterDto, MediaFilterSchema } from './dto/media-filter.dto';
import { MediaFileDto } from './dto/media-file.dto';
import { BodySchema } from 'src/shared/decorators/body-schema.decorator';
import { BulkDeleteDto, BulkDeleteSchema } from './dto/bulk-delete.dto';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly uploadService: UploadFileService) {}

  private toResponse(file: MediaFile): MediaFileDto {
    const { id, variants, mimetype, size, createdAt } = file;
    return { id, variants, mimetype, size, createdAt };
  }

  @HttpCode(200)
  @ApiOperation({ summary: 'Upload ảnh' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({ status: 201, description: 'Thành công, trả về URL' })
  @ApiResponse({
    status: 400,
    description: 'Lỗi định dạng hoặc vượt dung lượng',
  })
  @Post('upload')
  @Permissions(PermissionName.MANAGE_MEDIA)
  async upload(
    @Req()
    req: FastifyRequest,
  ) {
    if (!req.isMultipart()) {
      throw new BadRequestException('Form must be multipart/form-data');
    }
    const part = await req.file();

    if (!part) throw new NotFoundException('File không có');

    // Validate mime
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(part.mimetype)) {
      throw new BadRequestException('Chỉ JPG/PNG/GIF');
    }
    // Lưu & resize
    const variants = await req.server.fileManager.saveFile(part);

    // Build DTO, lưu DB
    const mediaDto: CreateMediaDto = {
      mimetype: part.mimetype,
      size: part.file?.bytesRead || 0,
      variants: {
        thumbnail: `/uploads/${variants.thumbnail}`,
        medium: `/uploads/${variants.medium}`,
        large: `/uploads/${variants.large}`,
      },
    };
    return this.uploadService.create(mediaDto);
  }

  @Get('categories')
  getCategories() {
    return ['image', 'video', 'document', 'audio'];
  }

  @Get()
  async findAll(@QuerySchema(MediaSchema) dto: MediaDto) {
    const paginate = await this.uploadService.paginateMedia(dto);
    const stats = await this.uploadService.getMediaWithStats();
    return {
      ...paginate,
      stats,
    };
  }

  @Get('all')
  @Permissions(PermissionName.VIEW_MEDIA)
  async findAllList(): Promise<MediaFileDto[]> {
    const files = await this.uploadService.findAll();
    return files.map((file) => this.toResponse(file));
  }

  @Get('/:id')
  @Permissions(PermissionName.VIEW_MEDIA)
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<MediaFileDto> {
    const file = await this.uploadService.findOne(id);
    return this.toResponse(file);
  }

  @Put(':id')
  @Permissions(PermissionName.VIEW_MEDIA)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: Partial<UploadFileDto>,
  ): Promise<MediaFileDto> {
    const updated = await this.uploadService.update(id, body as any);
    return this.toResponse(updated);
  }

  @Get('filter')
  @Permissions(PermissionName.VIEW_MEDIA)
  async findByType(@QuerySchema(MediaFilterSchema) dto: MediaFilterDto) {
    const files = await this.uploadService.findByMimeType(dto.type);
    return files.map((file) => this.toResponse(file));
  }

  @Get('download/:filename')
  @Permissions(PermissionName.VIEW_MEDIA)
  download(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    try {
      const stream = req.server.fileManager.getStream(filename);
      res.raw.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(filename)}"`,
      );
      res.raw.setHeader('Content-Type', 'application/octet-stream');
      stream.pipe(res.raw);
    } catch {
      res.status(500).send({ message: 'Download failed' });
    }
  }

  @Delete(':id')
  @HttpCode(204)
  @Permissions(PermissionName.MANAGE_MEDIA)
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: FastifyRequest,
  ) {
    const { deleted } = req.server.fileManager.deleteFile(id);
    await this.uploadService.remove(id);
    return {
      message: deleted,
    };
  }

  @Post('delete-many')
  @Permissions(PermissionName.MANAGE_MEDIA)
  @HttpCode(204)
  async bulkDelete(
    @BodySchema(BulkDeleteSchema) dto: BulkDeleteDto,
    @Req() req: FastifyRequest,
  ) {
    const files = await this.uploadService.findManyByIds(dto.ids);

    if (!files || files.length === 0) {
      throw new NotFoundException('Không tìm thấy file nào trong danh sách.');
    }

    const existingIds = files.map((f) => f.id);
    const notFoundIds = dto.ids.filter((id) => !existingIds.includes(id));
    if (notFoundIds.length > 0) {
      throw new NotFoundException(
        `Các ID không tồn tại: ${notFoundIds.join(', ')}`,
      );
    }

    await Promise.all(
      files.map(async (file) => {
        const deleted = req.server.fileManager.deleteFile(file.variants.large);
        if (!deleted || !deleted.deleted) {
          throw new NotFoundException(
            `Không xóa được file từ ổ đĩa: ${file.variants.large}`,
          );
        }
        await this.uploadService.remove(file.id);
      }),
    );

    return;
  }
}

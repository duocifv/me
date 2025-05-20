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
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { pipeline } from 'node:stream/promises';
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
    const part = await req.file();
    console.log('part.mimetype', part?.mimetype);
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
  async findOne(@Param('id') id: string): Promise<MediaFileDto> {
    const file = await this.uploadService.findOne(id);
    return this.toResponse(file);
  }

  @Put(':id')
  @Permissions(PermissionName.VIEW_MEDIA)
  async update(
    @Param('id') id: string,
    @Body() body: Partial<UploadFileDto>,
  ): Promise<MediaFileDto> {
    const updated = await this.uploadService.update(id, body as any);
    return this.toResponse(updated);
  }

  @Delete(':id')
  @HttpCode(204)
  @Permissions(PermissionName.MANAGE_MEDIA)
  async remove(@Param('id') id: string, @Req() req: FastifyRequest) {
    const { deleted } = req.server.fileManager.deleteFile(id);
    await this.uploadService.remove(id);
    return {
      message: deleted,
    };
  }

  @Get('filter')
  @Permissions(PermissionName.VIEW_MEDIA)
  async findByType(@QuerySchema(MediaFilterSchema) dto: MediaFilterDto) {
    const files = await this.uploadService.findByMimeType(dto.type);
    return files.map((file) => this.toResponse(file));
  }

  @Get('download/:filename')
  @Permissions(PermissionName.VIEW_MEDIA)
  async download(
    @Param('filename') filename: string,
    @Res() res: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    const stream = req.server.fileManager.getStream(filename);
    res.header(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}"`,
    );
    await pipeline(stream, res.raw);
  }

  @Delete()
  @Permissions(PermissionName.MANAGE_MEDIA)
  @HttpCode(204)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @Req() req: FastifyRequest,
  ) {
    if (!Array.isArray(body.ids))
      throw new BadRequestException('Invalid format');

    for (const id of body.ids) {
      req.server.fileManager.deleteFile(id);
      await this.uploadService.remove(id);
    }

    return { message: 'Deleted successfully' };
  }
}

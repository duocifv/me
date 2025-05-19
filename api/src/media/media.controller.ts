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
  UseInterceptors,
  UploadedFile,
  FileTypeValidator,
  ParseFilePipe,
  MaxFileSizeValidator,
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
import { CreateMediaDto } from './dto/CreateMediaDto';
import { QuerySchema } from 'src/shared/decorators/query-schema.decorator';
import { MediaDto, MediaSchema } from './dto/media.dto';

interface FileResponse {
  id: string;
  variants: Record<'thumbnail' | 'medium' | 'large', string>;
  mimetype: string;
  size: number;
  createdAt: Date;
}

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly uploadService: UploadFileService) {}

  private toResponse(file: MediaFile): FileResponse {
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
    if (!part) throw new NotFoundException('File không có');

    // Validate mime
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(part.mimetype)) {
      throw new BadRequestException('Chỉ JPG/PNG/GIF');
    }
    // Lưu & resize
    const variants = await req.server.fileManager.saveFile(part);

    // Build DTO, lưu DB
    const mediaDto: CreateMediaDto = {
      mime: part.mimetype,
      size: part.file?.bytesRead || 0,
      variants: {
        thumbnail: `/uploads/${variants.thumbnail}`,
        medium: `/uploads/${variants.medium}`,
        large: `/uploads/${variants.large}`,
      },
    };
    return this.uploadService.create(mediaDto);
  }

  @Get()
  async findAll(@QuerySchema(MediaSchema) dto: MediaDto) {
    const paginate = await this.uploadService.findAllPaginate(dto);
    // const list = await this.uploadService.findAll();
    // return list.map((file) => this.toResponse(file));
    const stats = await this.uploadService.getMediaWithStats();
    return {
      ...paginate,
      stats,
    };
  }

  @Get('/:id')
  @Permissions(PermissionName.VIEW_MEDIA)
  async findOne(@Param('id') id: string): Promise<FileResponse> {
    const file = await this.uploadService.findOne(id);
    return this.toResponse(file);
  }

  @Put(':id')
  @Permissions(PermissionName.VIEW_MEDIA)
  async update(
    @Param('id') id: string,
    @Body() body: Partial<UploadFileDto>,
  ): Promise<FileResponse> {
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
}

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
import { UploadFileDto } from './upload-file.dto';
import { PermissionName } from 'src/permissions/permission.enum';
import { Permissions } from 'src/permissions/permissions.decorator';

@ApiTags('Media')
@Controller('media')
export class FileController {
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
  async upload(@Req() req: FastifyRequest) {
    const part = await req.file();
    if (!part) {
      throw new NotFoundException('file không có');
    }
    await req.server.fileManager.saveFile(part);
    return { message: 'Upload thành công' };
  }

  @Get()
  findAll(@Req() req: FastifyRequest) {
    return { files: req.server.fileManager.listFiles() };
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

  @Get('/:id')
  @Permissions(PermissionName.VIEW_MEDIA)
  findOne(@Param('id') id: string) {
    return `GET /api/upload/files/${id}`;
  }

  @Put(':id')
  @Permissions(PermissionName.VIEW_MEDIA)
  update(@Param('id') id: string, @Body() body: any) {
    return `PUT /api/upload/files/${id}`;
  }

  @Delete(':id')
  @HttpCode(204)
  @Permissions(PermissionName.MANAGE_MEDIA)
  remove(@Param('id') id: string, @Req() req: FastifyRequest) {
    try {
      const { deleted } = req.server.fileManager.deleteFile(id);
      return {
        message: deleted,
      };
    } catch {
      throw new NotFoundException('file không có');
    }
  }
}

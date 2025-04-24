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
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { pipeline } from 'node:stream/promises';
import { UploadFileDto } from './upload-file.dto';

@Controller('files')
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
  async upload(@Req() req: FastifyRequest) {
    const parts = req.files() as AsyncIterable<any>;
    for await (const part of parts) {
      await req.server.fileManager.saveFile(part);
    }
    return { message: 'Upload thành công' };
  }

  @Get()
  list(@Req() req: FastifyRequest) {
    return { files: req.server.fileManager.listFiles() };
  }

  @Get('download/:filename')
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

  @Delete(':filename')
  @HttpCode(204)
  remove(@Param('filename') filename: string, @Req() req: FastifyRequest) {
    try {
      const { deleted } = req.server.fileManager.deleteFile(filename);
      return {
        message: deleted,
      };
    } catch {
      throw new NotFoundException('file không có');
    }
  }
}

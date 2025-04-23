// src/modules/file-upload/upload.controller.ts

import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Public } from 'src/common/decorators/public.decorator';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { FileUploadService } from './file-upload.service';

class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Chọn tệp hình ảnh (PNG, JPEG, GIF), max 5MB',
  })
  file: any;
}

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Public()
  @ApiOperation({ summary: 'Upload ảnh (PNG/JPEG/GIF), max 5MB' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({ status: 201, description: 'Upload thành công, trả về URL.' })
  @ApiResponse({ status: 400, description: 'Sai định dạng hoặc vượt quá size.' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const timestamp = Date.now();
          const orig = file.originalname.replace(/\s+/g, '_');
          cb(null, `${timestamp}-${orig}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg', 'image/gif'];
        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('Chỉ cho phép PNG/JPEG/GIF'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.fileUploadService.saveFile(file);
    return { url: result.url };
  }
}

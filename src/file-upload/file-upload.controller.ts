// upload.controller.ts
import {
  BadRequestException,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileInterceptor,
  UploadedFile,
  MemoryStorageFile,
} from '@blazity/nest-file-fastify';

import { Public } from 'src/common/decorators/public.decorator';
import { ApiConsumes } from '@nestjs/swagger';
import { ApiFileBody } from '@webundsoehne/nest-fastify-file-upload';
import { FileUploadService } from './file-upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @Public()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb): void => {
        const allowed = ['image/png', 'image/jpeg', 'image/gif'];
        if (!allowed.includes(file.mimetype)) {
          cb(new BadRequestException('Unsupported file type'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiFileBody('file')
  uploadFile(@UploadedFile() file: MemoryStorageFile) {
    return this.fileUploadService.saveFile(file);
  }
}

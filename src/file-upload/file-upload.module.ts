// file-upload.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileUploadService } from './file-upload.service';
import { UploadController } from './file-upload.controller';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [FileUploadService],
})
export class FileUploadModule {}

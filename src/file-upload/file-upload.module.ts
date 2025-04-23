import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';

@Module({
  imports: [ConfigModule],
  controllers: [FileUploadController],
  providers: [FileUploadService],
})
export class FileUploadModule {}

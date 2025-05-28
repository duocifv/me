import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaController } from './v1/media.controller';
import { MediaFile } from './entities/media.entity';
import { UploadFileService } from './v1/media.service';

@Module({
  imports: [TypeOrmModule.forFeature([MediaFile])],
  controllers: [MediaController],
  providers: [UploadFileService],
  exports: [UploadFileService],
})
export class MediaModule {}

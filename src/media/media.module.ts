import { Module } from '@nestjs/common';
import { FileController } from './media.controller';

@Module({
  controllers: [FileController],
})
export class FileModule {}

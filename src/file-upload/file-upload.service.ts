// src/modules/file-upload/file-upload.service.ts

import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { extension } from 'mime-types';

@Injectable()
export class FileUploadService {
  private readonly tmpDir = join(process.cwd(), 'uploads');
  private readonly destDir = join(process.cwd(), 'dist', 'uploads');

  constructor() {
    this.initDirs();
  }

  private async initDirs() {
    for (const dir of [this.tmpDir, this.destDir]) {
      try {
        await mkdir(dir, { recursive: true });
      } catch (err) {
        console.error('Cannot create directory', dir, err);
        throw new InternalServerErrorException('Server lỗi thư mục lưu file.');
      }
    }
  }

  private genName(ext: string): string {
    return `${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`;
  }

  async saveFile(file: Express.Multer.File): Promise<{ url: string }> {
    const ext = extension(file.mimetype);
    if (!ext) throw new BadRequestException('Định dạng không hợp lệ.');

    const finalName = this.genName(ext);
    const destPath = join(this.destDir, finalName);

    try {
      await pipeline(
        createReadStream(file.path),
        createWriteStream(destPath),
      );
    } catch (err) {
      console.error('Lỗi khi ghi file', err);
      throw new InternalServerErrorException('Lưu file thất bại.');
    }

    return { url: `/uploads/${finalName}` };
  }
}

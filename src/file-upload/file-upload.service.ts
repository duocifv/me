import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { extension } from 'mime-types';
import { randomBytes } from 'crypto';

@Injectable()
export class FileUploadService {
  private readonly destDir = join(process.cwd(), 'uploads', 'public');

  constructor() {
    this.init();
  }

  private async init() {
    try {
      await mkdir(this.destDir, { recursive: true });
    } catch (err) {
      throw new InternalServerErrorException('Không tạo được thư mục lưu ảnh');
    }
  }

  private generateName(ext: string): string {
    return `${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`;
  }

  async saveFile(file: Express.Multer.File): Promise<{ url: string }> {
    const ext = extension(file.mimetype);
    if (!ext) throw new BadRequestException('Định dạng ảnh không hợp lệ');

    const filename = this.generateName(ext);
    const destPath = join(this.destDir, filename);

    try {
      await pipeline(createReadStream(file.path), createWriteStream(destPath));
    } catch (err) {
      throw new InternalServerErrorException('Ghi file thất bại');
    }

    return { url: `/uploads/public/${filename}` };
  }
}

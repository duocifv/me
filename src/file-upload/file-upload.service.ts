import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { MemoryStorageFile } from '@blazity/nest-file-fastify';
import { randomBytes } from 'crypto';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { createWriteStream } from 'fs';
import { extension } from 'mime-types';

@Injectable()
export class FileUploadService {
  private readonly uploadsDir = join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadsDir();
  }

  private async ensureUploadsDir(): Promise<void> {
    try {
      await mkdir(this.uploadsDir, { recursive: true });
    } catch (err) {
      console.error('Failed to create uploads directory:', err);
      throw new InternalServerErrorException('Không thể tạo thư mục uploads.');
    }
  }

  private generateFileName(ext: string): string {
    const suffix = randomBytes(8).toString('hex');
    return `${suffix}.${ext}`;
  }

  async saveFile(file: MemoryStorageFile): Promise<{ url: string }> {
    const mimeType = String(file.mimetype);
    const ext = extension(mimeType);
    if (!ext) {
      throw new BadRequestException(
        `Không hỗ trợ định dạng tệp: ${file.mimetype}`,
      );
    }

    const fileName = this.generateFileName(ext);
    const filePath = join(this.uploadsDir, fileName);

    try {
      const readableStream = Readable.from(file.buffer);
      const writableStream = createWriteStream(filePath);
      await pipeline(readableStream, writableStream);
    } catch (err) {
      console.error('File saving failed:', err);
      throw new InternalServerErrorException('Lỗi khi lưu tệp.');
    }

    return { url: `/uploads/${fileName}` };
  }
}

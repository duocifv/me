import fp from 'fastify-plugin';
import multipart from '@fastify/multipart';
import { pipeline } from 'node:stream/promises';
import {
  createWriteStream,
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
} from 'fs';
import { join, extname, normalize } from 'path';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { FastifyInstance } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import type { Readable } from 'stream';
import { Jimp } from 'jimp';
import { v4 as uuidv4 } from 'uuid';
import { uploadConfig } from './config';

export interface FileManager {
  saveEsp32Image(
    part: MultipartFile,
  ): Promise<{ filename: string; url: string }>;
  saveFile(part: MultipartFile): Promise<Record<string, string>>;
  listFiles(): string[];
  getStream(filename: string): Readable;
  deleteFile(filename: string): { deleted: string };
}

declare module 'fastify' {
  interface FastifyInstance {
    fileManager: FileManager;
  }
}

export const fileManagerPlugin = fp(async (fastify: FastifyInstance) => {
  const { uploadDir, limits, allowedMimeTypes, sizes } = uploadConfig;

  // 1) Đăng ký multipart với giới hạn kích thước
  await fastify.register(multipart, { limits });

  // Tạo thư mục chính nếu chưa tồn tại
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

  // Tạo thư mục esp32 riêng để lưu ảnh ESP32
  const esp32Dir = join(uploadDir, 'esp32');
  if (!existsSync(esp32Dir)) mkdirSync(esp32Dir, { recursive: true });

  // Tạo thư mục temp nếu cần
  const tempDir = join(uploadDir, 'temp');
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

  const fileManager: FileManager = {
    async saveEsp32Image(part) {
      const { filename, mimetype, file } = part;

      // a) Kiểm tra MIME
      if (!['image/jpeg', 'image/png'].includes(mimetype)) {
        throw new BadRequestException('ESP32 chỉ hỗ trợ JPEG/PNG');
      }

      // b) Tạo tên file đơn giản theo UUID
      const id = uuidv4();
      const ext = extname(filename) || '.jpg'; // fallback .jpg
      const finalName = `${id}${ext}`;
      const finalPath = normalize(join(esp32Dir, finalName)); // Lưu vào /uploads/esp32/

      // c) Lưu stream vào disk
      try {
        await pipeline(file, createWriteStream(finalPath));
      } catch {
        throw new BadRequestException('Không thể lưu ảnh từ ESP32');
      }

      return { filename: finalName, url: `/uploads/esp32/${finalName}` };
    },

    async saveFile(part) {
      const { filename, mimetype, file } = part;

      // a) Validate MIME type
      if (!allowedMimeTypes.includes(mimetype)) {
        throw new BadRequestException('Định dạng file không được hỗ trợ');
      }

      // b) Sinh UUID và đường dẫn raw
      const id = uuidv4();
      const rawExt = extname(filename) || '';
      const rawName = `${id}-raw${rawExt}`;
      const rawPath = normalize(join(tempDir, rawName));

      // c) Ghi stream xuống disk
      try {
        await pipeline(file, createWriteStream(rawPath));
      } catch {
        throw new BadRequestException('Không thể lưu file tải lên');
      }

      let image;
      try {
        image = await Jimp.read(rawPath);
      } catch {
        unlinkSync(rawPath);
        throw new BadRequestException('Không thể xử lý ảnh');
      }

      const result: Record<string, string> = {};
      // image.resize({ w: 2000 });
      // image.quantize({
      //   colors: 64,
      //   colorDistanceFormula: 'euclidean-bt709',
      //   imageQuantization: 'floyd-steinberg',
      //   paletteQuantization: 'wuquant'
      // });

      // console.log("rawPath---filename", part)
      // const origName = `${id}-original${rawExt}`;
      // const origPath = normalize(join(uploadDir, origName));
      // await image.write(origPath);
      // result.original = origName;

      // f) Các phiên bản resized
      await Promise.all(
        Object.entries(sizes).map(async ([key, width]) => {
          const verName = `${id}-${key}${rawExt}`;
          const verPath = normalize(join(uploadDir, verName));
          await image
            .clone()
            .quantize({
              colors: 64,
              colorDistanceFormula: 'euclidean-bt709',
              imageQuantization: 'floyd-steinberg',
              paletteQuantization: 'wuquant',
            })
            .resize({ w: width })
            .write(verPath);
          result[key] = verName;
        }),
      );

      // // g) Xóa raw file
      unlinkSync(rawPath);

      return result;
    },

    listFiles() {
      return readdirSync(uploadDir);
    },

    getStream(filename: string) {
      const safe = normalize(filename);
      if (safe.includes('..')) {
        throw new BadRequestException('Tên file không hợp lệ');
      }
      const fullPath = normalize(join(uploadDir, safe));
      if (!existsSync(fullPath)) {
        throw new NotFoundException('File không tồn tại');
      }
      return createReadStream(fullPath);
    },

    deleteFile(filename: string) {
      const safe = normalize(filename);
      if (safe.includes('..')) {
        throw new BadRequestException('Tên file không hợp lệ');
      }
      const fullPath = normalize(join(uploadDir, safe));
      if (!existsSync(fullPath)) {
        throw new NotFoundException('File không tồn tại');
      }
      unlinkSync(fullPath);

      return { deleted: safe };
    },
  };

  fastify.decorate('fileManager', fileManager);
});

export default async function fileManager(app) {
  await app.register(fileManagerPlugin);
}

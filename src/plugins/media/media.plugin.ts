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
import { join, extname } from 'path';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { FastifyInstance } from 'fastify';
import type { Readable } from 'stream';
import Jimp from 'jimp';
import { v4 as uuidv4 } from 'uuid';
import { uploadConfig } from './config';

/**
 * Plugin kết hợp:
 * - @fastify/multipart để xử lý multipart upload
 * - fileManager: lưu, xử lý ảnh (validate, convert, nén, resize),
 *   và các thao tác list, stream, delete
 */
export const fileManagerPlugin = fp(async (fastify: FastifyInstance) => {
  const { uploadDir, limits, allowedMimeTypes, outputFormat, quality, sizes } = uploadConfig;

  // 1) Đăng ký multipart
  fastify.register(multipart, {
    limits,
  });

  // 2) Chuẩn bị thư mục lưu
 
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  // 3) Định nghĩa API fileManager
  const fileManager: FileManager = {
    /**
     * Lưu và xử lý file upload
     */
    async saveFile({ filename, file, mimetype }) {
      // 3.1) Kiểm tra MIME type
      if (!allowedMimeTypes.includes(mimetype)) {
        throw new BadRequestException('Định dạng file không được hỗ trợ');
      }

      // 3.2) Sinh UUID và path raw
      const uuid = uuidv4();
      const rawExt = extname(filename) || '';
      const rawPath = join(uploadDir, `${uuid}-raw${rawExt}`);
      const base = uuid;

      // 3.3) Đường dẫn lưu các phiên bản
      const paths: Record<string,string> = {
        original: join(uploadDir, `${base}-original.${outputFormat}`),
        thumbnail: join(uploadDir, `${base}-thumbnail.${outputFormat}`),
        medium: join(uploadDir, `${base}-medium.${outputFormat}`),
        large: join(uploadDir, `${base}-large.${outputFormat}`),
      };

      // 3.4) Lưu file gốc trực tiếp qua stream
      await pipeline(file, createWriteStream(rawPath));

      // 3.5) Xử lý ảnh với Jimp
      const image = await Jimp.read(rawPath);
      // 3.5.1) Save original
      await image.clone()
        .quality(quality.original)
        .writeAsync(paths.original);
      // 3.5.2) Resize các phiên bản
      await Promise.all(
        (Object.keys(sizes) as Array<keyof typeof sizes>).map(async key => {
          await image.clone()
            .resize(sizes[key], Jimp.AUTO)
            .quality(quality.resized)
            .writeAsync(paths[key]);
        })
      );

      // 3.6) Xóa raw file (tuỳ chọn)
      unlinkSync(rawPath);

      return { files: paths };
    },

    /** Đọc danh sách file */
    listFiles() {
      return readdirSync(uploadDir);
    },

    /** Trả về Readable stream của file */
    getStream(filename) {
      const filepath = join(uploadDir, filename);
      if (!existsSync(filepath)) {
        throw new NotFoundException('File không tồn tại');
      }
      return createReadStream(filepath);
    },

    /** Xóa file */
    deleteFile(filename) {
      const filepath = join(uploadDir, filename);
      if (!existsSync(filepath)) {
        throw new NotFoundException('File không tồn tại');
      }
      unlinkSync(filepath);
      return { deleted: filename };
    },
  };

  // 4) Decorate Fastify instance
  fastify.decorate('fileManager', fileManager);
});

/**
 * Interface mô tả API fileManager
 */
export interface FileManager {
  saveFile(part: { filename: string; file: Readable; mimetype: string }): Promise<{ files: Record<string,string> }>;
  listFiles(): string[];
  getStream(filename: string): Readable;
  deleteFile(filename: string): { deleted: string };
}

declare module 'fastify' {
  interface FastifyInstance {
    fileManager: FileManager;
  }
}

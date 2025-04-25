import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { join } from 'path';
import {
  existsSync,
  mkdirSync,
  createWriteStream,
  createReadStream,
  readdirSync,
  unlinkSync,
} from 'fs';
import { pipeline } from 'node:stream/promises';
import type { Readable } from 'stream';
import { NotFoundException } from '@nestjs/common';

export const fileManagerPlugin = fp((fastify: FastifyInstance) => {
  const uploadDir = join(__dirname, '../../uploads');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
  // 2. Cài đặt các method
  const fileManager: FileManager = {
    async saveFile({ filename, file }) {
      const safeName = encodeURIComponent(filename);
      const filepath = join(uploadDir, safeName);
      await pipeline(file, createWriteStream(filepath));
      return { filename: safeName, path: filepath };
    },
    listFiles() {
      return readdirSync(uploadDir);
    },
    getStream(filename) {
      const filepath = join(uploadDir, filename);
      if (!existsSync(filepath)) {
        throw new NotFoundException('File không tồn tại');
      }
      return createReadStream(filepath);
    },
    deleteFile(filename) {
      const filepath = join(uploadDir, filename);
      if (!existsSync(filepath)) {
        throw new NotFoundException('File không tồn tại');
      }
      unlinkSync(filepath);
      return { deleted: filename };
    },
  };

  // 3. Decorate Fastify instance với fileManager
  fastify.decorate('fileManager', fileManager);
});

// 1. Khai báo interface mô tả API của fileManager
export interface FileManager {
  saveFile(part: {
    filename: string;
    file: Readable;
  }): Promise<{ filename: string; path: string }>;
  listFiles(): string[];
  getStream(filename: string): Readable;
  deleteFile(filename: string): { deleted: string };
}

declare module 'fastify' {
  interface FastifyInstance {
    /** Custom file-manager API injected by fileManagerPlugin */
    fileManager: FileManager;
  }
}

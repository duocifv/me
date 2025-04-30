import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Jimp from 'jimp';
import { uploadConfig } from '../plugins/media/config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function uploadService(file: any): Promise<Record<string, string>> {
  const { uploadDir, outputFormat, allowedMimeTypes, quality, sizes } = uploadConfig;

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('File không hợp lệ. Chỉ cho phép các định dạng hình ảnh phổ biến.');
  }

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const chunks: Buffer[] = [];
  for await (const chunk of file.file) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  const uuid = uuidv4();
  const ext = outputFormat;

  const paths = {
    original: path.join(uploadDir, `${uuid}-original.${ext}`),
    thumbnail: path.join(uploadDir, `${uuid}-thumbnail.${ext}`),
    medium: path.join(uploadDir, `${uuid}-medium.${ext}`),
    large: path.join(uploadDir, `${uuid}-large.${ext}`),
  };

  // Load ảnh từ buffer
  const image = await Jimp.read(buffer);

  // Lưu ảnh gốc
  await image.quality(quality.original).writeAsync(paths.original);

  // Tạo ảnh thumbnail
  await image.clone()
    .resize(sizes.thumbnail, Jimp.AUTO)
    .quality(quality.resized)
    .writeAsync(paths.thumbnail);

  // Tạo ảnh medium
  await image.clone()
    .resize(sizes.medium, Jimp.AUTO)
    .quality(quality.resized)
    .writeAsync(paths.medium);

  // Tạo ảnh large
  await image.clone()
    .resize(sizes.large, Jimp.AUTO)
    .quality(quality.resized)
    .writeAsync(paths.large);

  return paths;
}

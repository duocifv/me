// segmenter.mjs
import { pipeline } from '@xenova/transformers';
import * as PImage from 'pureimage';
import fetch from 'node-fetch';
import { createWriteStream } from 'fs';
import { Readable } from 'node:stream';

// 1. Tạo pipeline và phân đoạn ảnh
const segmenter = await pipeline(
  'image-segmentation',
  'Xenova/segformer-b0-finetuned-ade-512-512',
);

const imageUrl =
  'https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2024/12/6/4497447028701650784800684553931527616634873n-1733459757494251021106.jpg';
const output = await segmenter(imageUrl);

// 2. Tải ảnh gốc và decode bằng pureimage
const fetchImage = async (url) => {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  const stream = Readable.from(buffer);
  return await PImage.decodeJPEGFromStream(stream);
};
const originalImage = await fetchImage(imageUrl);

// 3. Lặp qua từng mask
for (const item of output) {
  const { label, mask } = item;

  const width = mask.width;
  const height = mask.height;
  const data = mask.data; // Uint8ClampedArray chứa 0~255 (xác suất thuộc mask)

  // Kiểm tra xem mask có vùng nào không (tránh tạo ảnh rỗng)
  const hasMask = data.some((v) => v > 127);
  if (!hasMask) {
    console.log(`⚠️  ${label} is empty – skipped.`);
    continue;
  }

  const maskedImage = PImage.make(width, height);
  const ctx = maskedImage.getContext('2d');

  const originalCtx = originalImage.getContext('2d');
  const originalData = originalCtx.getImageData(0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const newData = imageData.data;

  const threshold = 127;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const pixelIndex = idx * 4;

      if (data[idx] > threshold) {
        newData[pixelIndex + 0] = originalData.data[pixelIndex + 0]; // R
        newData[pixelIndex + 1] = originalData.data[pixelIndex + 1]; // G
        newData[pixelIndex + 2] = originalData.data[pixelIndex + 2]; // B
        newData[pixelIndex + 3] = 255; // A
      } else {
        newData[pixelIndex + 0] = 0;
        newData[pixelIndex + 1] = 0;
        newData[pixelIndex + 2] = 0;
        newData[pixelIndex + 3] = 0;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const outPath = `./img/${label}_cropped.png`;
  const outStream = createWriteStream(outPath);
  await PImage.encodePNGToStream(maskedImage, outStream);
  console.log(`✅ Saved: ${outPath}`);
}

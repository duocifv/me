import path from 'path';

export const uploadConfig = {
  uploadDir: path.resolve(__dirname, '../../../uploads'),
  outputFormat: 'jpg',
  allowedMimeTypes: [
    'image/bmp',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/tiff',
    // 'image/webp',
    // 'image/svg+xml',
    // 'image/x-icon',
    // 'image/heic',
    // 'image/heif',
    // 'image/avif',
  ],
  quality: {
    original: 80,
    resized: 70,
  },
  sizes: {
    thumbnail: 320,
    medium: 640,
    large: 1280,
  },
  limits: {
    fieldNameSize: 100,
    fieldSize: 100,
    fields: 10,
    fileSize: 1_000_000,
    files: 1,
    headerPairs: 2000,
    parts: 1000,
  },
};

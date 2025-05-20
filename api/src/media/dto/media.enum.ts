import { z } from 'zod';

export const MediaCategoryEnum = z.enum([
  'image',
  'video',
  'document',
  'audio',
]);

export const ImageMimeTypeEnum = z.enum([
  'image/jpeg',
  'image/png',
  'image/gif',
]);

export type ImageMimeType = z.infer<typeof ImageMimeTypeEnum>;

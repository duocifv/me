import { z } from 'zod';
import { ImageMimeTypeEnum } from './media.enum';

export const MediaFilterSchema = z.object({
  type: ImageMimeTypeEnum,
});

export type MediaFilterDto = z.infer<typeof MediaFilterSchema>;

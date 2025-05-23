import { z } from 'zod';
import { ImageMimeTypeEnum } from './media.enum';
import { MediaCategory } from '../type/media-category.type';

export const MediaSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, { message: 'Page phải ≥ 1' })
    .max(1000, { message: 'Page tối đa là 1000' })
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1, { message: 'Limit phải ≥ 1' })
    .max(50, { message: 'Limit tối đa là 50' })
    .default(10),

  mimetype: ImageMimeTypeEnum.optional(),

  category: z
    .union([z.nativeEnum(MediaCategory), z.array(z.nativeEnum(MediaCategory))])
    .optional(),

  startDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'startDate phải là ngày hợp lệ ISO',
    })
    .optional(),

  endDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'endDate phải là ngày hợp lệ ISO',
    })
    .optional(),
});

export type MediaDto = z.infer<typeof MediaSchema>;

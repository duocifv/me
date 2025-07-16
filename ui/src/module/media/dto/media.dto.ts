import { z } from 'zod';
import { ImageMimeTypeEnum, MediaCategoryEnum } from './media.enum';

export const MediaSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().max(50).positive().default(10),
  mimetype: ImageMimeTypeEnum.optional(),
  category: MediaCategoryEnum.optional(),
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

import { z } from 'zod';
import { MediaCategory } from '../type/media-category.type';

export const MediaEsp32Schema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, { message: 'Page must be at least 1' })
    .max(1000, { message: 'Page must be at most 1000' }) // giả sử max 1000 page
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1, { message: 'Limit must be at least 1' })
    .max(50, { message: 'Limit must be at most 50' })
    .default(10),

  category: z
    .union([z.nativeEnum(MediaCategory), z.array(z.nativeEnum(MediaCategory))])
    .optional(),

  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'Start date must be in YYYY-MM-DD format',
    })
    .optional(),

  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'End date must be in YYYY-MM-DD format',
    })
    .optional(),
});

export type MediaEsp32Dto = z.infer<typeof MediaEsp32Schema>;

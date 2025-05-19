import { z } from 'zod';

export const MediaSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});
export type MediaDto = z.infer<typeof MediaSchema>;

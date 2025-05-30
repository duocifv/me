import { z } from 'zod';

export const CreatePlantTypeSchema = z.object({
  slug: z.string().min(1).max(50),
  displayName: z.string().min(1).max(100),
  mediaId: z
    .string()
    .uuid({ message: 'mediaId phải là UUID hợp lệ' })
    .optional(),
});

export type CreatePlantTypeDto = z.infer<typeof CreatePlantTypeSchema>;

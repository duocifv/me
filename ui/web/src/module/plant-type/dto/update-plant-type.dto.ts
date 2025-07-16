import { z } from 'zod';

export const UpdatePlantTypeSchema = z.object({
  slug: z.string().min(1).max(50).optional(),
  displayName: z.string().min(1).max(100).optional(),
  mediaId: z.string().uuid().optional(),
});

export type UpdatePlantTypeDto = z.infer<typeof UpdatePlantTypeSchema>;

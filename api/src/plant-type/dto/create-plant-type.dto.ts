import { z } from 'zod';

export const CreatePlantTypeSchema = z.object({
  slug: z.string().min(1).max(50),
  displayName: z.string().min(1).max(100),
});

export type CreatePlantTypeDto = z.infer<typeof CreatePlantTypeSchema>;

import { z } from 'zod';

export const IdParamSchema = z.object({
  id: z.string().min(1, 'ID must be a non-empty string'),
});

export type IdParamDto = z.infer<typeof IdParamSchema>;

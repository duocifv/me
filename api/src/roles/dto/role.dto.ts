import { z } from 'zod';

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
});
export type RoleDto = z.infer<typeof RoleSchema>;

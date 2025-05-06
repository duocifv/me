import { z } from 'zod';

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type RoleDto = z.infer<typeof RoleSchema>;

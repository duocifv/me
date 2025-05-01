import { z } from 'zod';

export const UpdateRoleSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
});
export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;

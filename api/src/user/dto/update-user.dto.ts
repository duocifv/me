import { RoleSchema } from 'src/roles/dto/role.dto';
import { z } from 'zod';

export const UpdateByAdminUserSchema = z.object({
  isActive: z.boolean().optional(),
  isPaid: z.boolean().optional(),
  roles: z.array(RoleSchema).optional(),
});
export type UpdateByAdminUserDto = z.infer<typeof UpdateByAdminUserSchema>;

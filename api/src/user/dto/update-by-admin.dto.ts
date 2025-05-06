import { Roles } from 'src/roles/role.enum';
import { z } from 'zod';

export const UpdateByAdminSchema = z.object({
  isActive: z.boolean().optional(),
  isPaid: z.boolean().optional(),
  roles: z.array(z.nativeEnum(Roles)).optional(),
});

export type UpdateByAdminDto = z.infer<typeof UpdateByAdminSchema>;

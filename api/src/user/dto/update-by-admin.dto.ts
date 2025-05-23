import { Roles } from 'src/roles/dto/role.enum';
import { z } from 'zod';
import { UserStatus } from './user-status.enum';

export const UpdateByAdminSchema = z.object({
  isActive: z.boolean().optional(),
  isPaid: z.boolean().optional(),
  roles: z.array(z.nativeEnum(Roles)).optional(),
  status: z.array(z.nativeEnum(UserStatus)).optional(),
});
export type UpdateByAdminDto = z.infer<typeof UpdateByAdminSchema>;

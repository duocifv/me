import { z } from 'zod';
import { Roles } from './role.enum';

export const CreateRoleSchema = z.object({
  name: z.nativeEnum(Roles),
  description: z.string().optional(),
  permissionIds: z.array(z.string().uuid()).optional().refine(
    (arr) => arr === undefined || arr.length > 0,
    { message: 'permissionIds must not be an empty array if provided' }
  ),
});

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;

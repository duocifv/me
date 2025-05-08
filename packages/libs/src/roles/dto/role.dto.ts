import { z } from 'zod';
import { PermissionSchema } from '../../permissions/dto/permission.dto';
import { Roles } from './role.enum';

export const RoleFullSchema = z.object({
  id: z.string(),
  name: z.nativeEnum(Roles),
  description: z.string().nullable().optional(),
  permissions: z.array(PermissionSchema).default([]),
});

export const RolePublicSchema = RoleFullSchema.omit({
  permissions: true,
});

export type RoleDto = z.infer<typeof RolePublicSchema>;
export type RoleFullDto = z.infer<typeof RoleFullSchema>;
export const RoleListSchema = z.array(RolePublicSchema);
export type RoleListDto = z.infer<typeof RoleListSchema>;

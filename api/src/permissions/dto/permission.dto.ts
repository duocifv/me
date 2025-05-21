import { z } from 'zod';
import { PermissionName } from './permission.enum';

export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
});

export const PermissionListSchema = z.array(PermissionSchema);

export const UpdatePermissionSchema = z.object({
  name: z.nativeEnum(PermissionName),
});

export const CreatePermissionSchema = z.object({
  name: z.nativeEnum(PermissionName),
});

export type PermissionListDto = z.infer<typeof PermissionListSchema>;
export type UpdatePermissionDto = z.infer<typeof UpdatePermissionSchema>;
export type CreatePermissionDto = z.infer<typeof CreatePermissionSchema>;

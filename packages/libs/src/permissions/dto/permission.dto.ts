import { z } from 'zod';

export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
});

export type PermissionDto = z.infer<typeof PermissionSchema>;
export const PermissionListSchema = z.array(PermissionSchema);
export type PermissionListDto = z.infer<typeof PermissionListSchema>;

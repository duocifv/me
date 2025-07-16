import { z } from "zod";

export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const PermissionListSchema = z.array(PermissionSchema);

export type PermissionDto = z.infer<typeof PermissionSchema>;
export type PermissionListDto = z.infer<typeof PermissionListSchema>;

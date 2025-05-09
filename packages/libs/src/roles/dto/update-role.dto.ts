// update-role.dto.ts
import { z } from "zod";

export const UpdateRoleSchema = z.object({
  permissions: z.array(z.string().uuid()).optional(),
});

export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;

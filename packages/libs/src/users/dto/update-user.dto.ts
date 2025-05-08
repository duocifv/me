import { z } from "zod";
import { RoleSchema } from "../../roles/dto_old/role.dto";

export const UpdateByAdminUserSchema = z.object({
  isActive: z.boolean().optional(),
  isPaid: z.boolean().optional(),
  roles: z.array(RoleSchema).optional(),
});
export type UpdateByAdminUserDto = z.infer<typeof UpdateByAdminUserSchema>;

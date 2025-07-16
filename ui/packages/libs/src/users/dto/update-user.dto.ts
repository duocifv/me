import { z } from "zod";
import { Roles } from "../../roles/dto/roles.enum";

export const UpdateByAdminUserSchema = z.object({
  isActive: z.boolean().optional(),
  isPaid: z.boolean().optional(),
  roles: z.array(z.nativeEnum(Roles)).optional(),
});
export type UpdateByAdminUserDto = z.infer<typeof UpdateByAdminUserSchema>;

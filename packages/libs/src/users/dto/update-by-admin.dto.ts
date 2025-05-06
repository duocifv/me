import { z } from "zod";
export enum Roles {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  CUSTOMER = "CUSTOMER",
  GUEST = "GUEST",
}

export const UpdateByAdminSchema = z.object({
  isActive: z.boolean().optional(),
  isPaid: z.boolean().optional(),
  roles: z.array(z.nativeEnum(Roles)).optional(),
});

export type UpdateByAdminDto = z.infer<typeof UpdateByAdminSchema>;

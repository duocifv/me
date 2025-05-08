import { CreateRoleSchema } from "./create-role.dto";
import { z } from "zod";

export const UpdateRoleSchema = CreateRoleSchema.partial();

export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;

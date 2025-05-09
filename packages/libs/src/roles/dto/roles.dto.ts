import { z } from "zod";
import { Roles } from "./roles.enum";

export const RoleFullSchema = z.object({
  id: z.string(),
  name: z.nativeEnum(Roles),
  description: z.string().nullable().optional(),
  permissions: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .default([]),
  users: z
    .array(
      z.object({
        id: z.string(),
        email: z.string(),
      })
    )
    .default([]),
});

export const RolePublicSchema = RoleFullSchema.omit({
  users: true,
});

export const RoleListSchema = z.array(RolePublicSchema);

export type RoleDto = z.infer<typeof RolePublicSchema>;
export type RoleFullDto = z.infer<typeof RoleFullSchema>;
export type RoleListDto = z.infer<typeof RoleListSchema>;

import { z } from "zod";
import { UserStatus } from "./user-status.enum";
import { Roles } from "../../roles/dto/roles.enum";

export const BasePaginateSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  search: z.string().optional(),
});

export const GetUsersSchema = BasePaginateSchema.extend({
  status: z
    .preprocess((val) => {
      if (typeof val === "string") return [val];
      return val;
    }, z.array(z.nativeEnum(UserStatus)))
    .optional(),

  roles: z
    .preprocess((val) => {
      if (typeof val === "string") return [val];
      return val;
    }, z.array(z.nativeEnum(Roles)))
    .optional(),

  isActive: z.preprocess(
    (val) => (val === "true" ? true : val === "false" ? false : val),
    z.boolean().optional()
  ),
  isPaid: z.preprocess(
    (val) => (val === "true" ? true : val === "false" ? false : val),
    z.boolean().optional()
  ),
});

export type GetUsersDto = z.infer<typeof GetUsersSchema>;

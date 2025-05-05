import { z } from "zod";

export const BasePaginateSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  search: z.string().optional(),
});

export const GetUsersSchema = BasePaginateSchema.extend({
  status: z.enum(["pending", "active", "blocked"]).optional(),
  isActive: z.preprocess((val) => {
    if (val === true) return 1;
    if (val === false) return 0;
    return val;
  }, z.number().optional()),
  isPaid: z.preprocess((val) => {
    if (val === true) return 1;
    if (val === false) return 0;
    return val;
  }, z.number().optional()),
});

export type GetUsersDto = z.infer<typeof GetUsersSchema>;

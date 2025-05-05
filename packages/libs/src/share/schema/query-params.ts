import { z } from "zod";

export const queryParamsSchema = z.object({
  currentPage: z.number().int().positive().default(1).optional(),
  itemsPerPage: z.number().int().positive().default(10).optional(),
  categoryId: z.string().optional(),
  name: z.string().optional(),
  sort: z.string().optional(),
});
export type QueryParams = z.infer<typeof queryParamsSchema>;

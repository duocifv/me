import { z } from "zod";

export const PaginationMetaSchema = z.object({
  itemCount: z.number().int().nonnegative().default(0),
  totalItems: z.number().int().default(0),
  itemsPerPage: z.number().int().nonnegative().default(10),
  totalPages: z.number().int().default(1),
  currentPage: z.number().int().nonnegative().default(1),
});

export const PaginationLinksSchema = z.object({
  first: z.string().optional(),
  previous: z.string().optional(),
  next: z.string().optional(),
  last: z.string().optional(),
});

export const PaginationSchema = z.object({
  meta: PaginationMetaSchema.default({}),
});

export type IPaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type IPaginationLinks = z.infer<typeof PaginationLinksSchema>;
export type IPagination = z.infer<typeof PaginationSchema>;

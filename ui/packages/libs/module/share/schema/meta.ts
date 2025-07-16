import { infer, z, ZodType } from "zod";

const meta = z.object({
  totalItems: z.number().default(0),
  currentPage: z.number().default(1),
  itemsPerPage: z.number().default(10),
  totalPages: z.number().default(1),
});

export const metaSchema = <T extends ZodType<any, any>>(itemSchema: T) =>
  z.object({
    results: z.array(itemSchema).default([]),
    ...meta.shape,
  });

export type Meta = z.infer<typeof meta>;
export interface PaginationMeta<T> extends Meta {
  results: T[];
}
export type Pagination<T extends ZodType<any, any>> = z.infer<
  ReturnType<typeof metaSchema<T>>
>;

export const paginationSchema = <T extends ZodType>(results: T, data: unknown) => {
  const schema = metaSchema(results).parse(data);
  return schema;
};

export const idSchema = z.object({
  id: z.number().int().positive(),
});

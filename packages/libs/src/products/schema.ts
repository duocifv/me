import { z } from "zod";

export const productsSchema = z.object({
  id: z.number().int().positive().default(0),
  name: z.string().default(""),
  description: z.string().default(""),
  price: z.number().default(0),
  categories: z.object({
    id: z.number().int().positive().default(0),
    name: z.string().default(""),
  }).default({
    id: 0,
    name: ""
  })
});

import { z } from "zod";

export const blogOptionsSchema = z.object({
  filter: z.string().default(""),
  sortField: z.string().default("created_at"),
  sortOrder: z.string().default("desc"),
  page: z.number().default(1),
  pageSize: z.number().default(10),
});

export const blogSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(3, "Title is required"),
  content: z.string().min(3, "Content is required"),
  author: z.string().min(3, "Author is required"),
  category: z.string(),
});

export const blogListSchema = z.object({
  data: z.array(blogSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
    totalRecords: z.number(),
  }),
});

export const idSchema = z.object({
  id: z.number().int().positive(),
});

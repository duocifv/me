import { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { z } from "zod";
import { blogListSchema, blogOptionsSchema, blogSchema } from "./schema";

export type Blog = z.infer<typeof blogSchema>;
export type BlogOptions = z.infer<typeof blogOptionsSchema>;
export type BlogList = z.infer<typeof blogListSchema>;

export interface BlogService {
  getAll: (options?: Partial<BlogOptions>) => Promise<BlogList>;
  getById: (id: number) => Promise<Blog>;
  create: (post: Blog) => Promise<Blog>;
  update: (post: Blog) => Promise<Blog>;
  delete: (id: number) => Promise<void>;
}

export interface BlogState extends BlogOptions {
  alert: { message?: string; type: "error" | "success" } | null;
  setFilter: (value: string) => void;
  setSortField: (value: string) => void;
  setSortOrder: (value: string) => void;
  setPage: (value: number) => void;
  useGetAll: (value?: BlogList) => UseQueryResult<BlogList>;
  useGetById: (value: number) => UseQueryResult<Blog>;
  useCreate: () => UseMutationResult<Blog, Error, Blog, unknown>;
  useUpdate: () => UseMutationResult<Blog, Error, Blog, unknown>;
  useDelete: () => UseMutationResult<void, Error, number, unknown>;
}

import { $del, $get, $post, $put } from "../share/api/apiHelpers";
import { Blog, BlogList, BlogService } from "./domain";

import {
  blogListSchema,
  blogOptionsSchema,
  blogSchema,
  idSchema,
} from "./schema";

export const endpoint = "blogs";

export const blogService = (): BlogService => ({
  getAll: async (options) => {
    const parsedOptions = blogOptionsSchema.parse(options);
    const { data } = await $get<BlogList>(endpoint, parsedOptions);
    return blogListSchema.parse(data);
  },

  getById: async (id) => {
    const parsedId = idSchema.parse(Number(id));
    const { data } = await $get<Blog>(`${endpoint}/${parsedId}`);
    return blogSchema.parse(data);
  },

  create: async (blog) => {
    const parsedBlog = blogSchema.parse(blog);
    const { data } = await $post<Blog>(endpoint, parsedBlog);
    return blogSchema.parse(data);
  },

  update: async (blog) => {
    const { id, ...rest } = blogSchema.parse(blog);
    const { data } = await $put<Blog>(`${endpoint}/${id}`, rest);
    return blogSchema.parse(data);
  },

  delete: async (id) => {
    const parsedId = idSchema.parse(Number(id));
    await $del(`blogs/${parsedId}`);
  },
});

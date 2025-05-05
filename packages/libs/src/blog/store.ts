import { create } from "zustand";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
// import { immer } from "zustand/middleware/immer";
import { blogOptionsSchema } from "./schema";
import { blogService } from "./service";
import { BlogState } from "./domain";

const innit = blogOptionsSchema.parse({});
const blog = blogService();

export const blogsStore = create<BlogState>()((set, get) => ({
  ...innit,
  alert: null,
  setFilter: (filter) => set({ filter }),
  setSortField: (sortField) => set({ sortField }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  setPage: (page) => set({ page }),
  useGetAll: (value) => {
    const first = useRef(true);
    useEffect(() => {
      first.current = false;
    }, []);
    const { page, filter, sortField, sortOrder } = get();
    const option = { page, filter, sortField, sortOrder };
    return useQuery({
      queryKey: ["blogs", option],
      queryFn: () => blog.getAll(option),
      placeholderData: first.current ? value : keepPreviousData,
      staleTime: 300000,
      refetchOnMount: true,
    });
  },
  useGetById: (id) =>
    useQuery({
      queryKey: ["blog", id],
      queryFn: () => blog.getById(id),
      staleTime: 300000,
      refetchOnMount: false,
      enabled: !!id,
    }),
  useCreate: () =>
    useMutation({
      mutationFn: blog.create,
      onSuccess: () => set({ alert: { message: "Đã tạo", type: "success" } }),
      onError: () => set({ alert: { message: "Đã ko tạo", type: "error" } }),
    }),
  useUpdate: () =>
    useMutation({
      mutationFn: blog.update,
      onSuccess: () => set({ alert: { message: "Đã sửa", type: "success" } }),
      onError: () => set({ alert: { message: "Đã ko sửa", type: "error" } }),
    }),
  useDelete: () =>
    useMutation({
      mutationFn: blog.delete,
      onSuccess: () => set({ alert: { message: "Đã xóa", type: "success" } }),
      onError: (error) =>
        set({ alert: { message: error.message, type: "error" } }),
    }),
}));

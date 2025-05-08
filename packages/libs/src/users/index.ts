"use client";
import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usersStore } from "./users.store";
import { usersApi } from "./users.api";
import { UpdateByAdminDto } from "./dto/update-by-admin.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { useShallow } from "zustand/shallow";
import { useMemo } from "react";

export function useUsers() {
  const { filters, setFilters } = usersStore(
    useShallow((state) => ({
      filters: state.filters,
      setFilters: state.setFilters,
    }))
  );
  const queryClient = useQueryClient();
  const memoizedFilters = useMemo(() => filters, [filters]);

  const listUsers = useQuery({
    queryKey: ["users", memoizedFilters],
    queryFn: () => usersApi.getAll(filters),
    placeholderData: keepPreviousData,
  });

  const createUser = useMutation({
    mutationFn: (payload: CreateUserDto) => usersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateByAdminDto }) =>
      usersApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // Xóa người dùng
  // const deleteUser = useMutation({
  //   mutationFn: (id: string) => usersApi.remove(id),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["users"] });
  //   },
  // });

  return {
    filters,
    setFilters,
    listUsers,
    createUser,
    updateUser,
  };
}

"use client";
import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usersStore } from "./users.store";
import { UpdateByAdminDto } from "./dto/update-by-admin.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { useShallow } from "zustand/shallow";
import { useMemo } from "react";
import { userService } from "./users.service";

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
    queryFn: () => userService.getAllUsers(filters),
    placeholderData: keepPreviousData,
  });

  const createUser = useMutation({
    mutationFn: (dto: CreateUserDto) => userService.createUser(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateByAdminDto }) =>
      userService.updateUser(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    filters,
    setFilters,
    listUsers,
    createUser,
    updateUser,
  };
}

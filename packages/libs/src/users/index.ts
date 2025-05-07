"use client";
import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usersStore } from "./users.store";
import { usersApi } from "./users.api";
import { UserDto } from "./dto/user.dto";
import { UpdateByAdminDto } from "./dto/update-by-admin.dto";

export function useUsers() {
  const filters = usersStore((s) => s.filters);
  const setFilters = usersStore((s) => s.setFilters);
  const queryClient = useQueryClient();

  const listUsers = useQuery({
    queryKey: ["users", filters],
    queryFn: () => usersApi.getAll(filters),
    placeholderData: keepPreviousData,
  });

  const createUser = useMutation({
    mutationFn: (payload: UserDto) => usersApi.create(payload),
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

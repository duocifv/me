"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useUsersStore } from "./users.store";
import { userService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateByAdminDto } from "./dto/update-by-admin.dto";

export function useUsersQuery() {
  const filters = useUsersStore((s) => s.filters);
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => userService.getAllUsers(filters),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateByAdminDto }) =>
      userService.updateUser(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUserDto) => userService.createUser(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

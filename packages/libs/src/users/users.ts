"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUsersStore } from "./users.store";
import { userService } from "./users.service";
import { useCallback, useEffect } from "react";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateByAdminDto } from "./dto/update-by-admin.dto";
import { IUserListResponseSchema } from "./dto/user-list.dto";

// Optional: Debug render count
let count = 0;

export function useUsers() {
  count++;
  console.log("useUsers render count:", count);

  const queryClient = useQueryClient();
  const filters = useUsersStore((s) => s.filters);

  // ✅ Memoized invalidate function
  const invalidateUsers = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  }, [queryClient]);

  // ✅ useQuery for user list
  const listUsers = useQuery({
    queryKey: ["users", filters],
    queryFn: () => userService.getAllUsers(filters),
  });

  // ✅ useMutation for create
  const createUser = useMutation({
    mutationFn: (dto: CreateUserDto) => userService.createUser(dto),
    onSuccess: invalidateUsers,
  });

  // ✅ useMutation for update
  const updateUser = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateByAdminDto }) =>
      userService.updateUser(id, body),
    onSuccess: invalidateUsers,
  });

  return {
    filters,
    listUsers,
    createUser,
    updateUser,
  };
}

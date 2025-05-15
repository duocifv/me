"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { UpdateRoleDto } from "./dto/update-role.dto";
import { roleService } from "./roles.service";

export function useRolesQuery() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.findAll(),
  });
}

export function useRolesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoleDto }) =>
      roleService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

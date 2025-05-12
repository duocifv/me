"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { UpdateRoleDto } from "./dto/update-role.dto";
import { roleService } from "./roles.service";

export function useRoles() {
  const queryClient = useQueryClient();

  const rolesList = useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.findAll(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoleDto }) =>
      roleService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  return {
    rolesList,
    updateRoleMutation,
  };
}

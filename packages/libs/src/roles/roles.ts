"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { rolesApi } from "./roles.api";
import { UpdateRoleDto } from "./dto/update-role.dto";


export function useRoles() {
  const queryClient = useQueryClient();

  const rolesList = useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesApi.getAll(),
    placeholderData: keepPreviousData,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoleDto }) =>
      rolesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  return {
    rolesList,
    updateRoleMutation,
  };
}

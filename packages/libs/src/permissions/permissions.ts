"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { permissionsApi } from "./permissions.api";
import { Permissions, permissionsStore } from "./permissions.store";
import { initPermissionMap } from "./permission.utils";

export function usePermissions(user_role: Permissions[]) {
  const setPermissions = permissionsStore((state) => state.setPermissions);
  const permissions = permissionsStore((state) => state.permissions);

  const shouldFetch = permissions.length === 0;

  const result = useQuery({
    queryKey: ["permissions"],
    queryFn: () => permissionsApi.getAll(),
    enabled: shouldFetch,
  });

  useEffect(() => {
    if (result.isSuccess && shouldFetch) {
      setPermissions(result?.data);
    }
  }, [result.data, result.isSuccess, permissions]);

 
  const permissionsList = initPermissionMap(result.data ?? [], user_role);

  return {
    permissionsList,
    ...result,
  };
}

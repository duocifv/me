"use client";
import { useQuery } from "@tanstack/react-query";
import { permissionsApi } from "./permissions.api";
import { permissionsStore } from "./permissions.store";

export function usePermissions() {
  const setPermissions = permissionsStore((state) => state.setPermissions);
  const result = useQuery({
    queryKey: ["permissions"],
    queryFn: () => permissionsApi.getAll(),
  });
  return {
    ...result,
    setPermissions,
  };
}

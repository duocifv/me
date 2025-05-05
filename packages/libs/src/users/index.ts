"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usersStore } from "./users.store";
import { usersApi } from "./users.api";

export function useUsers() {
  const filters = usersStore((s) => s.filters);
  const setFilters = usersStore((s) => s.setFilters);
  const { getAll } = usersApi;
  const results = useQuery({
    queryKey: ["users", filters],
    queryFn: () => getAll(filters),
    placeholderData: keepPreviousData,
  });
  return {
    results,
    filters,
    setFilters,
  };
}

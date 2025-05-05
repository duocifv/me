import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { productsService } from "./service";
import { productsStore } from "./store";

export function useProducts() {
  const filters = productsStore((s) => s.filters);
  const setFilters = productsStore((s) => s.setFilters);
  const { getAll } = productsService();

  const resource = useQuery({
    queryKey: ["products", filters],
    queryFn: () => getAll(filters),
    placeholderData: keepPreviousData,
  });

  return {
    resource,
    state: {
      filters,
      setFilters,
    },
  };
}

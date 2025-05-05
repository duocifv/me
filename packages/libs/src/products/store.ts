import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ProductsState } from "./domain";

export const productsStore = create<ProductsState>()(
  immer((set, get) => ({
    filters: {
      currentPage: 1,
      itemsPerPage: 10,
    },
    alert: null,
    setFilters: (filters) =>
      set((state) => ({
        filters: {
          ...state.filters,
          ...filters,
        },
      })),
    setAlert: (alert) => set({ alert }),
  }))
);

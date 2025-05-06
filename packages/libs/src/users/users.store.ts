"use client";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { GetUsersDto } from "./dto/get-users.dto";

export interface IUserState {
  filters: GetUsersDto;
  alert: { message?: string; type: "error" | "success" } | null;
  setFilters: (value?: object) => void;
  setAlert: (value: { message?: string; type: "error" | "success" }) => void;
}

export const usersStore = create<IUserState>()(
  immer((set, get) => ({
    filters: {
      page: 1,
      limit: 10,
      search: "",
      status: "pending",
      isActive: true,
      isPaid: false,
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

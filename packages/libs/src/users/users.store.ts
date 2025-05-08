"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { GetUsersDto } from "./dto/get-users.dto";

export interface IUserState {
  filters: GetUsersDto;
  setFilters: (patch: Partial<GetUsersDto>) => void;
}

export const usersStore = create<IUserState>()(
  devtools(
    immer((set, get) => ({
      filters: {
        page: 1,
        limit: 10,
        search: "",
        isActive: false,
        isPaid: false,
        status: [],
        roles: [],
      },
      setFilters: (patch: Partial<GetUsersDto>) =>
        set((state) => {
          state.filters = {
            ...state.filters,
            ...patch,
          };
        }),
    })),
    { name: "UsersStore" }
  )
);

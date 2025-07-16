"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { GetUsersDto } from "./dto/get-users.dto";
import { IUserListResponse } from "./dto/user-list.dto";

export interface IUserState {
  data: IUserListResponse;
  filters: GetUsersDto;
  setFilters: (patch: Partial<GetUsersDto>) => void;
  setData: (data: IUserListResponse) => void;
}

export const useUsersStore = create<IUserState>()(
  devtools(
    immer((set, get) => ({
      data: {
        items: [],
        meta: {
          itemCount: 0,
          totalItems: 0,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
        stats: {
          totalUsers: 0,
          activeUsers: 0,
          newUsers: 0,
          conversionRate: 0,
        },
      },
      filters: {
        page: 1,
        limit: 10,
      },
      setData: (data) => set({ data }),
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

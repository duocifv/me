"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { PaginatedMediaResponse } from "./dto/media-pagination";
import { MediaDto } from "./dto/media.dto";

export interface IUserState {
  data: PaginatedMediaResponse;
  filters: MediaDto;
  setFilters: (patch: Partial<MediaDto>) => void;
  setData: (data: PaginatedMediaResponse) => void;
}

export const useMediaStore = create<IUserState>()(
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
          totalFile: 0,
          totalStorage: 0,
          imagesStorage: 0,
        },
      },
      filters: {
        page: 1,
        limit: 10,
      },
      setData: (data) => set({ data }),
      setFilters: (patch: Partial<MediaDto>) =>
        set((state) => {
          state.filters = {
            ...state.filters,
            ...patch,
          };
        }),
    })),
    { name: "MediaStore" }
  )
);

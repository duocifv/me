"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { PaginatedMediaResponse } from "./dto/media-pagination";
import { MediaDto } from "./dto/media.dto";
import { FileType } from "./dto/media-upload.dto";

interface MediaState {
  data: PaginatedMediaResponse;
  file: FileType | null;
  fileInfo: File[];
  filters: MediaDto;
  setFilters: (patch: Partial<MediaDto>) => void;
  setFile: (file: File | null) => void;
  setFileInfo: () => void;
  setData: (data: PaginatedMediaResponse) => void;
}

export const useMediaStore = create<MediaState>()(
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
      file: null,
      fileInfo: [],
      setFile: (file) => set({ file }),
      setData: (data) => set({ data }),
      setFileInfo: () => {
        const file = get().file;
        if (!file) return;

        set((state) => {
          state.fileInfo.push(file);
        });

        get().setFile(null);
      },
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

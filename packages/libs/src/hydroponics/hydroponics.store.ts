"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { CropInstance } from "./dto_/crop-instance.dto";
import { Snapshot, SnapshotResponse } from "./dto/snapshot.dto";

export interface HydroponicsState {
  cropInstances: CropInstance[];
  snapshots: SnapshotResponse;
  selectedSnapshot: Snapshot | null;
  selectedCropInstanceId: number | null;

  setCropInstances: (data: CropInstance[]) => void;
  setSnapshots: (data: SnapshotResponse) => void;
  setSelectedCropInstanceId: (id: number | null) => void;
  setSelectedSnapshotById: (id: number | null) => void;
  removeSnapshot: (id: number) => void;
}

export const useHydroponicsStore = create<HydroponicsState>()(
  devtools(
    immer((set, get) => ({
      cropInstances: [],
      snapshots: {
        items: [],
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      },
      selectedSnapshot: null,
      selectedCropInstanceId: null,

      setCropInstances: (data) => set({ cropInstances: data }),
      setSnapshots: (data) => set({ snapshots: data }),
      setSelectedCropInstanceId: (id) => set({ selectedCropInstanceId: id }),
      setSelectedSnapshotById: (id) => {
        const snapshot = get().snapshots.items.find((s) => s.id === id) || null;
        set({ selectedSnapshot: snapshot });
      },
      removeSnapshot: (id) =>
        set((state) => {
          state.snapshots.items = state.snapshots.items.filter(
            (snap) => snap.id !== id
          );
        }),
    })),
    { name: "HydroponicsStore" }
  )
);

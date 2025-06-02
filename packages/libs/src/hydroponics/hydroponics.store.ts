"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { CropInstance } from "./dto/crop-instance.dto";
import { Snapshot } from "./dto/snapshot.dto";

export interface HydroponicsState {
  cropInstances: CropInstance[];
  snapshots: Snapshot[];
  selectedSnapshot: Snapshot | null;
  selectedCropInstanceId: number | null;

  setCropInstances: (data: CropInstance[]) => void;
  setSnapshots: (data: Snapshot[]) => void;
  setSelectedCropInstanceId: (id: number | null) => void;
  setSelectedSnapshotById: (id: number | null) => void;
  removeSnapshot: (id: number) => void;
}

export const useHydroponicsStore = create<HydroponicsState>()(
  devtools(
    immer((set, get) => ({
      cropInstances: [],
      snapshots: [],
      selectedSnapshot: null,
      selectedCropInstanceId: null,

      setCropInstances: (data) => set({ cropInstances: data }),
      setSnapshots: (data) => set({ snapshots: data }),
      setSelectedCropInstanceId: (id) => set({ selectedCropInstanceId: id }),
      setSelectedSnapshotById: (id) => {
        const snapshot = get().snapshots.find((s) => s.id === id) || null;
        set({ selectedSnapshot: snapshot });
      },
      removeSnapshot: (id) =>
        set((state) => {
          state.snapshots = state.snapshots.filter((snap) => snap.id !== id);
        }),
    })),
    { name: "HydroponicsStore" }
  )
);

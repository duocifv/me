"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { CropInstance } from "./dto/crop-instance.dto";
import { Snapshot } from "./dto/snapshot.dto";

export interface HydroponicsState {
  cropInstances: CropInstance[];
  snapshots: Snapshot[];
  selectedCropInstanceId: number | null;

  setCropInstances: (data: CropInstance[]) => void;
  setSnapshots: (data: Snapshot[]) => void;
  setSelectedCropInstanceId: (id: number | null) => void;
  setSelectedSnapshotId: (id: number | null) => void;
  removeSnapshot: (id: number) => void;
}

export const useHydroponicsStore = create<HydroponicsState>()(
  devtools(
    immer((set) => ({
      cropInstances: [],
      snapshots: [],
      selectedCropInstanceId: null,

      setCropInstances: (data) => set({ cropInstances: data }),
      setSnapshots: (data) => set({ snapshots: data }),
      setSelectedCropInstanceId: (id) => set({ selectedCropInstanceId: id }),
      setSelectedSnapshotId: (id) => set({ selectedCropInstanceId: id }),
      removeSnapshot: (id) =>
        set((state) => {
          state.snapshots = state.snapshots.filter((snap) => snap.id !== id);
        }),
    })),
    { name: "HydroponicsStore" }
  )
);

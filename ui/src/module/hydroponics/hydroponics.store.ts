"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { CropInstance } from "./dto_/crop-instance.dto";
import { Snapshot, SnapshotResponse } from "./dto/snapshot.dto";
import { CameraSnapshot, SensorSnapshot } from "./dto/snap.dto";

export interface HydroponicsState {
  cropInstances: CropInstance[];
  snapshots: SnapshotResponse;
  sensors: SensorSnapshot;
  camera: CameraSnapshot | null;
  selectedSnapshot: Snapshot | null;
  selectedCropInstanceId: number | null;
  filters: {
    page: number;
    limit: number;
  };
  setFilters: (filters: { page: number; limit: number }) => void;
  setCropInstances: (data: CropInstance[]) => void;
  setSnapshots: (data: SnapshotResponse) => void;
  setSensors: (sensors: SensorSnapshot) => void;
  setCamera: (camera: CameraSnapshot) => void;
  setSelectedCropInstanceId: (id: number | null) => void;
  setSelectedSnapshotById: (id: number | null) => void;
  removeSnapshot: (id: number) => void;
}

export const useHydroponicsStore = create<HydroponicsState>()(
  devtools(
    immer((set, get) => ({
      cropInstances: [],
      sensors: {
        waterTemperature: 0,
        ambientTemperature: 0,
        humidity: 0,
        time: "",
      },
      camera: null,
      filters: {
        page: 1,
        limit: 30,
      },
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

      setFilters: (filters) => set({ filters }),
      setCropInstances: (data) => set({ cropInstances: data }),
      setSensors: (sensors) => set({ sensors }),
      setCamera: (camera) => set({ camera }),
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

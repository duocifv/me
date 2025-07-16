"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { PlantTypeDto } from "./dto/plant-type-list.dto";

export interface PlantTypeState {
  data: PlantTypeDto[];
  selectedPlantId: number | null;

  setData: (data: PlantTypeDto[]) => void;
  setSelectedPlantId: (id: number | null) => void;
  removePlant: (id: number) => void;
}

export const usePlantTypeStore = create<PlantTypeState>()(
  devtools(
    immer((set, get) => ({
      data: [],
      selectedPlantId: null,

      setData: (data) => set({ data }),
      setSelectedPlantId: (id) => set({ selectedPlantId: id }),
      removePlant: (id) =>
        set((state) => {
          state.data = state.data.filter((plant) => plant.id !== id);
        }),
    })),
    { name: "PlantTypeStore" }
  )
);

"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { DeviceScheduleDto } from "./dto/device-schedule.dto";

export interface DeviceConfigState {
  data: DeviceScheduleDto[];
  item: DeviceScheduleDto | null;
  setData: (data: DeviceScheduleDto[]) => void;
  updateItem: (item: DeviceScheduleDto | null) => void;
}

export const useDeviceScheduleStore = create<DeviceConfigState>()(
  devtools(
    immer((set, get) => ({
      data: [],
      item: null,
      setData: (data) => set({ data }),
      updateItem: (item) => set({ item }),
    })),
    { name: "DeviceScheduleStore" }
  )
);

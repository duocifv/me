"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { ScheduleItem } from "./dto/schedule.type";

export interface DeviceConfigState {
  data: ScheduleItem[];
  item: ScheduleItem | null;
  setData: (data: ScheduleItem[]) => void;
  updateItem: (item: ScheduleItem | null) => void;
}

export const useDeviceScheduleStore = create<DeviceConfigState>()(
  devtools(
    immer((set) => ({
      data: [],
      item: null,
      setData: (data) => set({ data }),
      updateItem: (item) => set({ item }),
    })),
    { name: "DeviceScheduleStore" }
  )
);

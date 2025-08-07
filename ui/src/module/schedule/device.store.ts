"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { ScheduleItem } from "./dto/schedule.type";

export interface DeviceConfigState {
  on: boolean;
  data: ScheduleItem[];
  item: ScheduleItem | null;
  setOn: (on: boolean) => void;
  setData: (data: ScheduleItem[]) => void;
  updateItem: (item: ScheduleItem | null) => void;
}

export const useDeviceScheduleStore = create<DeviceConfigState>()(
  devtools(
    immer((set) => ({
      on: false,
      data: [],
      item: null,
      setOn: (on) => set({ on }),
      setData: (data) => set({ data }),
      updateItem: (item) => set({ item }),
    })),
    { name: "DeviceScheduleStore" }
  )
);

"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { CreateDeviceConfigDto } from "./dto/create-device-config.dto";

export interface DeviceConfigState {
  data: CreateDeviceConfigDto | null;
  setData: (data: CreateDeviceConfigDto) => void;
}

export const useDeviceConfigStore = create<DeviceConfigState>()(
  devtools(
    immer((set, get) => ({
      data: null,
      setData: (data) => set({ data }),
    })),
    { name: "DeviceConfigStore" }
  )
);

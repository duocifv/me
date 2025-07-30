"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { CreateDeviceConfigDto } from "./dto/create-device-config.dto";
import { SensorSnapshot } from "./dto/sensor.type";

export interface DeviceConfigState {
  data: CreateDeviceConfigDto | null;
  sensors: SensorSnapshot;
  setData: (data: CreateDeviceConfigDto) => void;
  setSensors: (sensors: SensorSnapshot) => void;
}

export const useDeviceConfigStore = create<DeviceConfigState>()(
  devtools(
    immer((set) => ({
      data: null,
      sensors: {
        waterTemperature: 0,
        ambientTemperature: 0,
        humidity: 0,
        time: "",
      },
      setData: (data) => set({ data }),
      setSensors: (sensors) => set({ sensors }),
    })),
    { name: "DeviceConfigStore" }
  )
);

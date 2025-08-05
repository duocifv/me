import z from "zod";

interface TimeRange {
  start: string;
  end: string;
}

interface DeviceSchedule {
  device: DeviceType;
  deviceId: string;
  times: TimeRange[];
}

export interface DeviceGemini {
  note: string;
  schedule: DeviceSchedule[];
}

export const DeviceTypeSchema = z.enum([
  'pumpOn',
  'fanOn',
  'ledOn',
  'sensor',
  'camera',
]);
export type DeviceType = z.infer<typeof DeviceTypeSchema>;
import { DeviceType } from "src/schedule/dto/device-schedule.dto";

interface TimeRange {
  start: string;
  end: string;
}

interface DeviceSchedule {
  device:  DeviceType,
  deviceId: string,
  times: TimeRange[];
}

export interface GeminiResponse {
  note: string;
  schedule: {
    pump: DeviceSchedule;
    fan: DeviceSchedule;
    led: DeviceSchedule;
  };
}

interface TimeRange {
  start: string;
  end: string;
}

interface DeviceSchedule {
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

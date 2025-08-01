interface TimeRange {
  start: string;
  end: string;
}

interface DeviceSchedule {
  device: string;
  deviceId: string;
  times: TimeRange[];
}

export interface DeviceGemini {
  note: string;
  schedule: DeviceSchedule[];
}

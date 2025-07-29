export interface ScheduleDto {
  id: string;
  deviceId: string;
  pumpOn: boolean;
  fanOn: boolean;
  ledOn: boolean;
  sensor: boolean;
  camera: boolean;
  startTime: string;
  endTime: string;
  repeatOn: number[];
  isEnabled: boolean;
  createdAt?: Date;
}

export interface DeviceState {
  pumpOn: boolean;
  fanOn: boolean;
  ledOn: boolean;
  sensor: boolean;
  camera: boolean;
}

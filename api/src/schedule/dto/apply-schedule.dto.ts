// dto/apply-schedule.dto.ts

import { DeviceType } from "./device-schedule.dto";


export class UpdateScheduleDto {
  times: { start: string; end: string }[];
  repeatOn: number[];
  isEnabled?: boolean;
}

export class ApplyScheduleDto {
  note: string;
  schedule: {
    device: DeviceType;
    deviceId: string;
    times: { start: string; end: string }[];
  }[];
}

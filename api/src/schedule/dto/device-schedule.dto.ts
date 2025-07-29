// src/device-config/dto/device-schedule.dto.ts
import { z } from 'zod';

export const DeviceScheduleSchema = z.object({
  pumpOn: z.boolean().default(false),
  fanOn: z.boolean().default(false),
  ledOn: z.boolean().default(false),
  sensor: z.boolean().default(false),
  camera: z.boolean().default(false),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  repeatOn: z.array(z.number()).min(1),
  isEnabled: z.boolean().default(true),
});

export type DeviceScheduleDto = z.infer<typeof DeviceScheduleSchema> & {
  id: string;
  createdAt?: Date;
};

export type DeviceConfigState = {
  pumpOn: boolean;
  fanOn: boolean;
  ledOn: boolean;
  sensor: boolean;
  camera: boolean;
};

export type DeviceScheduleItem = {
  deviceId: string;
  schedules: DeviceScheduleDto[];
};

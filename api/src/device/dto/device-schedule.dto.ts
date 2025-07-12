// src/device/dto/device-schedule.dto.ts
import { z } from 'zod';

export const DeviceScheduleSchema = z.object({
  pumpOn: z.boolean(),
  fanOn: z.boolean(),
  ledOn: z.boolean(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  repeatDaily: z.boolean().optional().default(true),
});

export type DeviceScheduleDto = z.infer<typeof DeviceScheduleSchema>;

import { z } from 'zod';

export const TimeRangeSchema = z.object({
  start: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
  end: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),
});

export const DeviceScheduleSchema = z.object({
  device: z.enum(['pump', 'fan', 'led', 'sensor', 'camera']),
  times: z.array(TimeRangeSchema).min(1),
  repeatOn: z.array(z.number().min(0).max(6)).min(1),
  isEnabled: z.boolean().default(true),
});

// Loại dữ liệu DTO
export type DeviceScheduleDto = z.infer<typeof DeviceScheduleSchema> & {
  id?: string;
  createdAt?: Date;
};

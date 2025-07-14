import { z } from 'zod';

export const DeviceScheduleSchema = z.object({
  pumpOn: z.boolean(),
  fanOn: z.boolean(),
  ledOn: z.boolean(),

  startTime: z.string().regex(/^\d{2}:\d{2}$/), // "HH:mm"
  endTime: z.string().regex(/^\d{2}:\d{2}$/), // "HH:mm"

  // Danh sách các ngày trong tuần: 0 (CN) -> 6 (T7)
  repeatOn: z
    .array(z.number().int().min(0).max(6))
    .default([0, 1, 2, 3, 4, 5, 6]),

  // Có bật lịch này không
  isEnabled: z.boolean().default(true),
});

export type DeviceScheduleDto = z.infer<typeof DeviceScheduleSchema>;

import { z } from 'zod';

// Enum để tái sử dụng và rõ ràng hơn
export const DeviceTypeEnum = z.enum([
  'fanCool',
  'fanVent',
  'pump',
  'led',
  'sensors',
  'camera',
]);

export type DeviceType = z.infer<typeof DeviceTypeEnum>;

// Kiểm tra định dạng thời gian HH:MM
export const TimeRangeSchema = z.object({
  start: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:MM format'),
  end: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:MM format'),
});

// Lịch bật/tắt thiết bị
export const DeviceScheduleSchema = z.object({
  device: DeviceTypeEnum,
  times: z.array(TimeRangeSchema).min(1, 'At least one time range is required'),
  repeatOn: z
    .array(z.number().int().min(0).max(6))
    .min(1, 'At least one repeat day is required'), // 0: Sunday, ..., 6: Saturday
  isEnabled: z.boolean().default(true),
});

// Xuất type từ schema
export type DeviceScheduleDto = z.infer<typeof DeviceScheduleSchema>;

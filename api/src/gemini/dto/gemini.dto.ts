import { z } from 'zod';

// 🎯 Enum các loại thiết bị hợp lệ
export const DeviceTypeSchema = z.enum([
  'pumpOn',
  'fanOn',
  'ledOn',
  'sensor',
  'camera',
]);
export type DeviceType = z.infer<typeof DeviceTypeSchema>;

// ✅ Schema cho từng mốc thời gian trong lịch
const timeRangeSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/, {
    message: 'Thời gian start phải có định dạng HH:mm',
  }),
  end: z.string().regex(/^\d{2}:\d{2}$/, {
    message: 'Thời gian end phải có định dạng HH:mm',
  }),
});

// ✅ Schema cho từng item trong mảng schedule
const scheduleItemSchema = z.object({
  deviceId: z.string().min(1, 'deviceId không được để trống'),
  device: DeviceTypeSchema,
  times: z.array(timeRangeSchema).min(1, 'Phải có ít nhất 1 khoảng thời gian'),
});

// ✅ Schema tổng gồm note và danh sách schedule
export const ScheduleGeminiSchema = z.object({
  note: z.string().min(1, 'note không được để trống'),
  schedule: z.array(scheduleItemSchema).min(1, 'schedule không được rỗng'),
});

// 🔁 Type inference cho việc sử dụng
export type ScheduleGeminiDto = z.infer<typeof ScheduleGeminiSchema>;

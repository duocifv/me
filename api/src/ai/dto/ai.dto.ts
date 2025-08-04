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

// ✅ Schema cho từng mốc thời gian
const timeRangeSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/, {
    message: 'Thời gian start phải có định dạng HH:mm',
  }),
  end: z.string().regex(/^\d{2}:\d{2}$/, {
    message: 'Thời gian end phải có định dạng HH:mm',
  }),
});

// ✅ Schema cho từng mục trong schedule
const scheduleItemSchema = z.object({
  deviceId: z.string().min(1, 'deviceId không được để trống'),
  device: DeviceTypeSchema,
  times: z.array(timeRangeSchema).min(1, 'Phải có ít nhất 1 khoảng thời gian'),
});

// ✅ Schema cho input môi trường
const inputEnvSchema = z.object({
  waterTemperature: z.number(),
  ambientTemperature: z.number(),
  humidity: z.number(),
});

// ✅ Schema đầy đủ 1 bản ghi lịch AI
export const ScheduleAISchema = z.object({
  id: z.number(),
  createdAt: z.string().datetime(), // hoặc .refine((val) => !isNaN(Date.parse(val)))
  updatedAt: z.string().datetime(),
  inputEnv: inputEnvSchema,
  schedule: z.array(scheduleItemSchema),
  note: z.string(),
  reward: z.number().nullable(),
  status: z.enum(['pending', 'approved', 'rejected']),
  feedback: z.string().nullable(),
  evaluatedAt: z.string().nullable(),
});

// ✅ Nếu muốn check danh sách
export const ScheduleAIListSchema = z.array(ScheduleAISchema);

// 🔁 Type inference
export type ScheduleAIDto = z.infer<typeof ScheduleAISchema>;
export type ScheduleAIListDto = z.infer<typeof ScheduleAIListSchema>;

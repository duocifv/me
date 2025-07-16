import { z } from "zod";

// Helper: chuyển "HH:mm" thành số phút kể từ 00:00
const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const DeviceScheduleSchema = z
  .object({
    id: z.number().optional(),
    deviceId: z.string(),
    pumpOn: z.boolean(),
    fanOn: z.boolean(),
    ledOn: z.boolean(),
    startTime: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Giờ bắt đầu không hợp lệ, định dạng HH:mm"
      ),
    endTime: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Giờ kết thúc không hợp lệ, định dạng HH:mm"
      ),
    repeatOn: z
      .array(z.coerce.number().min(0).max(6))
      .min(1, "Phải chọn ít nhất 1 ngày"),
    isEnabled: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const start = timeToMinutes(data.startTime);
    const end = timeToMinutes(data.endTime);
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "Giờ kết thúc phải lớn hơn giờ bắt đầu",
      });
    }
  });

export type DeviceScheduleDto = z.infer<typeof DeviceScheduleSchema>;

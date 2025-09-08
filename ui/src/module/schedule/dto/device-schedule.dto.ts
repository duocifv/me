import { z } from "zod";

export const TimeRangeSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/, {
    message: "Thời gian bắt đầu phải có định dạng HH:MM",
  }),
  end: z.string().regex(/^\d{2}:\d{2}$/, {
    message: "Thời gian kết thúc phải có định dạng HH:MM",
  }),
});

export const ScheduleItemSchema = z.object({
  device: z
    .enum(["pump", "fanCool", "fanVent", "led", "sensors", "camera"])
    .refine(
      (val) =>
        ["pump", "fanCool", "fanVent", "led", "sensors", "camera"].includes(
          val
        ),
      {
        message:
          "Thiết bị phải là một trong các giá trị: pump, fan, led, sensor, camera",
      }
    ),
  times: z
    .array(TimeRangeSchema)
    .min(1, { message: "Cần ít nhất 1 khoảng thời gian" }),
  repeatOn: z
    .array(z.number().min(0).max(6))
    .min(1, { message: "Chọn ít nhất 1 ngày trong tuần" }),
  isEnabled: z.boolean().default(true),
});

export type ScheduleItemDto = z.infer<typeof ScheduleItemSchema> & {
  id?: string;
  createdAt?: Date;
};

import { z } from "zod";

export const TimeRangeSchema = z.object({
  start: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
});

export const UpdateScheduleSchema = z.object({
  times: z.array(TimeRangeSchema).min(1),
  repeatOn: z.array(z.number().min(0).max(6)).min(1),
  isEnabled: z.boolean(),
});

export type UpdateScheduleDto = z.infer<typeof UpdateScheduleSchema>;

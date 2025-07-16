// src/dto/create-snapshot.dto.ts
import { z } from "zod";

// cropInstanceId: z
//   .number({ invalid_type_error: 'cropInstanceId phải là số' })
//   .int({ message: 'cropInstanceId phải là số nguyên' })
//   .positive({ message: 'cropInstanceId phải lớn hơn 0' }),

export const CreateSnapshotSchema = z.object({
  waterTemp: z
    .number()
    .min(-50, { message: "waterTemp tối thiểu -50" })
    .max(150, { message: "waterTemp tối đa 150" }),

  ambientTemp: z
    .number()
    .min(-50, { message: "ambientTemp tối thiểu -50" })
    .max(150, { message: "ambientTemp tối đa 150" }),

  humidity: z
    .number()
    .min(0, { message: "humidity tối thiểu 0" })
    .max(100, { message: "humidity tối đa 100" }),

  ph: z
    .number()
    .min(0, { message: "ph tối thiểu 0" })
    .max(14, { message: "ph tối đa 14" }),

  ec: z.number().min(0, { message: "ec không được âm" }),

  orp: z.number(),
});

export type CreateSnapshotDto = z.infer<typeof CreateSnapshotSchema>;

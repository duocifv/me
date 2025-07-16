// src/dto/get-snapshots.dto.ts
import { z } from "zod";

const MAX_LIMIT = 100; // Giới hạn tối đa cho 'limit'

export const GetSnapshotsSchema = z.object({
  deviceId: z.string().min(1, { message: "deviceId không được để trống" }),

  page: z.coerce
    .number()
    .int({ message: "page phải là số nguyên" })
    .positive({ message: "page phải là số dương" })
    .default(1),

  limit: z.coerce
    .number()
    .int({ message: "limit phải là số nguyên" })
    .positive({ message: "limit phải là số dương" })
    .max(MAX_LIMIT, { message: `limit không được vượt quá ${MAX_LIMIT}` })
    .default(10),
});

export type GetSnapshotsDto = z.infer<typeof GetSnapshotsSchema>;

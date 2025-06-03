// src/dto/get-snapshots.dto.ts
import { z } from 'zod';

const MAX_LIMIT = 100; // Giới hạn tối đa cho 'limit'

export const GetSnapshotsSchema = z.object({
  deviceId: z
    .string({ required_error: 'deviceId là bắt buộc' })
    .min(1, { message: 'deviceId không được để trống' }),

  page: z.coerce
    .number({
      invalid_type_error: 'page phải là số',
      required_error: 'page là bắt buộc',
    })
    .int({ message: 'page phải là số nguyên' })
    .positive({ message: 'page phải là số dương' })
    .default(1),

  limit: z.coerce
    .number({
      invalid_type_error: 'limit phải là số',
      required_error: 'limit là bắt buộc',
    })
    .int({ message: 'limit phải là số nguyên' })
    .positive({ message: 'limit phải là số dương' })
    .max(MAX_LIMIT, { message: `limit không được vượt quá ${MAX_LIMIT}` })
    .default(10),
});

export type GetSnapshotsDto = z.infer<typeof GetSnapshotsSchema>;

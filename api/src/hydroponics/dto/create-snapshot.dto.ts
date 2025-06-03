// src/dto/create-snapshot.dto.ts
import { z } from 'zod';

  // cropInstanceId: z
  //   .number({ invalid_type_error: 'cropInstanceId phải là số' })
  //   .int({ message: 'cropInstanceId phải là số nguyên' })
  //   .positive({ message: 'cropInstanceId phải lớn hơn 0' }),

export const CreateSnapshotSchema = z.object({

  waterTemp: z
    .number({ invalid_type_error: 'waterTemp phải là số' })
    .min(-50, { message: 'waterTemp tối thiểu -50' })
    .max(150, { message: 'waterTemp tối đa 150' }),

  ambientTemp: z
    .number({ invalid_type_error: 'ambientTemp phải là số' })
    .min(-50, { message: 'ambientTemp tối thiểu -50' })
    .max(150, { message: 'ambientTemp tối đa 150' }),

  humidity: z
    .number({ invalid_type_error: 'humidity phải là số' })
    .min(0, { message: 'humidity tối thiểu 0' })
    .max(100, { message: 'humidity tối đa 100' }),

  ph: z
    .number({ invalid_type_error: 'ph phải là số' })
    .min(0, { message: 'ph tối thiểu 0' })
    .max(14, { message: 'ph tối đa 14' }),

  ec: z
    .number({ invalid_type_error: 'ec phải là số' })
    .min(0, { message: 'ec không được âm' }),

  orp: z
    .number({ invalid_type_error: 'orp phải là số' }),
});

export type CreateSnapshotDto = z.infer<typeof CreateSnapshotSchema>;

import { z } from 'zod';

export const CreateCropInstanceSchema = z.object({
  plantTypeId: z
    .number({ required_error: 'plantTypeId là bắt buộc' })
    .int('plantTypeId phải là số nguyên'),
  name: z
    .string({ required_error: 'name là bắt buộc' })
    .min(1, 'name không được để trống'),
});

export type CreateCropInstanceDto = z.infer<typeof CreateCropInstanceSchema>;

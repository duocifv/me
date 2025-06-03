// src/dto/create-camera-image.dto.ts
import { z } from 'zod';

export const CreateCameraImageSchema = z.object({
  filename: z.string().min(1, 'filename không được để trống'),
  url: z.string().url('url phải hợp lệ'),
  mimetype: z.string().min(1, 'mimetype không được để trống'),
  size: z.number().int().positive().nullable(),
  category: z.string().min(1).optional(),
});

export type CreateCameraImageDto = z.infer<typeof CreateCameraImageSchema>;

// src/dto/create-camera-image.dto.ts
import { z } from 'zod';

export const CreateCameraImageSchema = z.object({
  filePath: z.string().url('url phải hợp lệ'),
  size: z.number().int().positive(),
});

export type CreateCameraImageDto = z.infer<typeof CreateCameraImageSchema>;

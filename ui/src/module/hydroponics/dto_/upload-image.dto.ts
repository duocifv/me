import { z } from 'zod';

export const UploadImageSchema = z.object({
  label: z.string().min(1, 'label không được để trống').optional(),
});

export type UploadImageDto = z.infer<typeof UploadImageSchema>;

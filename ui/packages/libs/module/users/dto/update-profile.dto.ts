// src/users/dto/update-profile.dto.ts
import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  status: z.enum(['pending', 'active', 'blocked'], {
    errorMap: () => ({ message: 'Trạng thái không hợp lệ' }),
  }),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

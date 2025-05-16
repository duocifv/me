// src/users/dto/update-profile.dto.ts
import { z } from 'zod';
import { UserStatus } from './user-status.enum';

export const UpdateProfileSchema = z.object({
  status: z.nativeEnum(UserStatus).array().optional(),
  email: z.string(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

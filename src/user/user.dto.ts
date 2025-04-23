// src/dto/user.dto.ts
import { z } from 'zod';

export const SelectDto = z.object({
  id: z.string().uuid({ message: 'Invalid user id' }),
});
export type SelectDto = z.infer<typeof SelectDto>;


export const CreateUserDto = z.object({
  name: z.string()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name must be at most 100 characters' }),
  email: z.string()
    .email({ message: 'Invalid email address' })
    .max(255, { message: 'Email must be at most 255 characters' }),
  isActive: z.boolean().optional().default(true),
});
export type CreateUserDto = z.infer<typeof CreateUserDto>;


export const UpdateUserDto = z.object({
  id: z.string().uuid({ message: 'Invalid user id' }),
  name: z.string()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name must be at most 100 characters' })
    .optional(),
  email: z.string()
    .email({ message: 'Invalid email address' })
    .max(255, { message: 'Email must be at most 255 characters' })
    .optional(),
  isActive: z.boolean().optional(),
});
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

import { z } from 'zod';

export const CreateUserSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be at most 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  email: z.string().email(),
  password: z.string().min(6),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

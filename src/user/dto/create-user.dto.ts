import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

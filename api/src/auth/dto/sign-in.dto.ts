import { z } from 'zod';

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  captchaToken: z.string().optional(),
});

export type SignInDto = z.infer<typeof SignInSchema>;

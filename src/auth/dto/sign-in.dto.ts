import { z } from 'zod';

export const SignInDto = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignInDto = z.infer<typeof SignInDto>;

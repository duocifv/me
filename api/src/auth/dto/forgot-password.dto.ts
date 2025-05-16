import { z } from 'zod';

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
});

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;

import { z } from 'zod';

export const ResetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z
    .string()
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

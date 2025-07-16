import { z } from 'zod';

export const ChangePasswordSchema = z.object({
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

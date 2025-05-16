import { z } from 'zod';

export const ChangePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(6, { message: 'Mật khẩu cũ phải có ít nhất 6 ký tự' }),
  newPassword: z
    .string()
    .min(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' }),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

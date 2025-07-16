import * as z from "zod";

export const ResetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Xác nhận mật khẩu ít nhất 6 ký tự"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

export const ResetPasswordTokenSchema = z.object({
  token: z.string().nonempty("Token đặt lại mật khẩu là bắt buộc"),
  newPassword: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});

export type ResetPasswordTokenDto = z.infer<typeof ResetPasswordTokenSchema>;

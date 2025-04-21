import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

// Zod schema cho CreateUserDto
export const CreateUserZod = z.object({
  email: z.string().email(),
  password: z.string().min(6), // Đảm bảo mật khẩu có ít nhất 6 ký tự
});

// export type CreateUserDto = z.infer<typeof CreateUserZod>;
export class CreateUserDto extends createZodDto(CreateUserZod) {}
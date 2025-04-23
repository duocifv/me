import { z } from 'zod';

export const CreateUserDto = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  age: z.number().int().min(0, 'Tuổi không hợp lệ')
});

export type CreateUserDto = z.infer<typeof CreateUserDto>;

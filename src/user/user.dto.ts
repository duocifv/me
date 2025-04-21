import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(100),
});

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  createdAt: z.date(),
});

// export type CreateUserDtoType = z.infer<typeof CreateUserDto>;
// export type UserDtoType = z.infer<typeof UserDto>;
export class CreateUserDto extends createZodDto(CreateUserSchema) {}
export class UserDto extends createZodDto(UserSchema) {}

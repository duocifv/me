import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const CreateUserZod = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export class CreateUserDto extends createZodDto(CreateUserZod) {}

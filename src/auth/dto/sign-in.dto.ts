import { z } from 'zod';

export const SignInDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type SignInDto = z.infer<typeof SignInDto>;

// import { createZodDto } from '@anatine/zod-nestjs';
// import { z } from 'zod';

// export const SignInSchema = z.object({
//   email: z.string().email(),
//   password: z.string(),
// });

// export class SignInDto extends createZodDto(SignInSchema) {}

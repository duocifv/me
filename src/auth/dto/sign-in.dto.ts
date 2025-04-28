import { z } from 'zod';

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type SignInDto = z.infer<typeof SignInSchema>;

export interface RefreshTokenPayload {
  sub: string; // User ID
  jti: string; // Token ID
  iat: number; // Issued at (timestamp)
  exp: number; // Expiration (timestamp)
}

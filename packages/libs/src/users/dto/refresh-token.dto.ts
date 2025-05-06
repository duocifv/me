import { z } from 'zod';

export const RefreshTokenSchema = z.object({
  id: z.number(),
  token: z.string(),
  expiresAt: z.date(),
});
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

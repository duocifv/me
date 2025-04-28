import { RefreshTokenSchema } from 'src/auth/dto/refresh-token.dto';
import { RoleSchema } from 'src/roles/dto/role.dto';
import { z } from 'zod';

export const UserFullSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string(),
  refreshTokens: z.array(RefreshTokenSchema).default([]),
  roles: z.array(RoleSchema).default([]),
});
export const UserSchema = UserFullSchema.omit({ password: true });
export type UserDto = z.infer<typeof UserSchema>;

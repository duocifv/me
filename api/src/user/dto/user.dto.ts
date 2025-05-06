import { z } from 'zod';
import { RefreshTokenSchema } from 'src/auth/dto/refresh-token.dto';
import { RoleSchema } from 'src/roles/dto/role.dto';

export const UserFullSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  refreshTokens: z.array(RefreshTokenSchema).default([]),
  roles: z.array(RoleSchema).default([]),
  isActive: z.boolean(),
  isPaid: z.boolean(),
  status: z.enum(['pending', 'active', 'blocked']),
  lastLoginAt: z.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export const UserSchema = UserFullSchema.omit({
  password: true,
  refreshTokens: true,
  deletedAt: true,
  lastLoginAt: true,
});

export type UserDto = z.infer<typeof UserSchema>;
export const UserListSchema = z.array(UserSchema);
export type UserListDto = z.infer<typeof UserListSchema>;

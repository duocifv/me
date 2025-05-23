import { z } from 'zod';
import { RefreshTokenSchema } from 'src/auth/dto/refresh-token.dto';
import { RoleFullSchema, RolePublicSchema } from 'src/roles/dto/role.dto';

export const UserFullSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  refreshTokens: z.array(RefreshTokenSchema).default([]),
  roles: z.array(RoleFullSchema).default([]),
  isPaid: z.boolean(),
  status: z.enum(['pending', 'active', 'blocked']),

  failedLoginAttempts: z.number().default(0),
  lockedUntil: z.date().nullable().optional(),

  resetPasswordToken: z.string().nullable().optional(),
  resetPasswordExpires: z.date().nullable().optional(),

  emailVerificationToken: z.string().nullable().optional(),
  emailVerificationExpires: z.date().nullable().optional(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export const UserWithPermissionsSchema = UserFullSchema.omit({
  password: true,
  refreshTokens: true,
  deletedAt: true,
  resetPasswordToken: true,
  resetPasswordExpires: true,
  failedLoginAttempts: true,
  lockedUntil: true,
}).extend({
  roles: z.array(RoleFullSchema),
});

export const UserSchema = UserFullSchema.omit({
  password: true,
  refreshTokens: true,
  deletedAt: true,
  resetPasswordToken: true,
  resetPasswordExpires: true,
  failedLoginAttempts: true,
  lockedUntil: true,
}).extend({
  roles: z.array(RolePublicSchema).optional(),
});

export type UserPrivateDto = z.infer<typeof UserFullSchema>;
export type UserDto = z.infer<typeof UserSchema>;
export const UserListSchema = z.array(UserSchema);
export type UserListDto = z.infer<typeof UserListSchema>;
export type UserWithPermissionsDto = z.infer<typeof UserWithPermissionsSchema>;

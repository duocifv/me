import { z } from "zod";
import { RefreshTokenSchema } from "./refresh-token.dto";
import { RoleSchema } from "../../roles/dto/role.dto";

export const UserFullSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  refreshTokens: z.array(RefreshTokenSchema).default([]),
  roles: z.array(RoleSchema).default([]),
  isActive: z.boolean(),
  isPaid: z.boolean(),
  status: z.enum(["pending", "active", "blocked"]),
  isEmailVerified: z.boolean(),
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

// Định nghĩa kiểu cho đối tượng UserDto để sử dụng trong ứng dụng
export type UserDto = z.infer<typeof UserSchema>;

export const UserListSchema = z.array(UserSchema);
export type UserListDto = z.infer<typeof UserListSchema>;

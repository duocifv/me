import { RefreshTokenSchema } from 'src/auth/dto/refresh-token.dto';
import { RoleSchema } from 'src/roles/dto/role.dto';
import { z } from 'zod';

// Định nghĩa schema cho toàn bộ đối tượng User (bao gồm các trường nhạy cảm)
export const UserFullSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(8), // Trường mật khẩu (nếu cần thiết, có thể giữ lại trong backend)
  refreshTokens: z.array(RefreshTokenSchema).default([]),
  roles: z.array(RoleSchema).default([]),
  isActive: z.boolean(), // Thêm các trường khác từ bảng nếu cần
  isPaid: z.boolean(), // Ví dụ: kiểm tra nếu người dùng đã thanh toán
  status: z.enum(['pending', 'active', 'blocked']),
  lastLoginAt: z.date().nullable(), // Trường có thể null
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(), // Trường bị xóa mềm
});

// Định nghĩa schema trả về cho client, loại bỏ các trường nhạy cảm
export const UserSchema = UserFullSchema.omit({
  password: true, // Loại bỏ trường password khi trả về client
  refreshTokens: true, // Có thể loại bỏ refreshTokens nếu không cần thiết trong response
  deletedAt: true, // Không trả về trường deletedAt (trường có thể bị xóa mềm)
  lastLoginAt: true, // Có thể loại bỏ trường lastLoginAt nếu không cần thiết
});

// Định nghĩa kiểu cho đối tượng UserDto để sử dụng trong ứng dụng
export type UserDto = z.infer<typeof UserSchema>;

export const UserListSchema = z.array(UserSchema);
export type UserListDto = z.infer<typeof UserListSchema>;

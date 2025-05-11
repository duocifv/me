import { $get, $post, $put, $del } from "../share/api/apiClient";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { GetUsersSchema } from "./dto/get-users.dto";
import { UpdateByAdminDto } from "./dto/update-by-admin.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import {
  IUserListResponse,
  IUserListResponseSchema,
} from "./dto/user-list.dto";
import { UserDto } from "./dto/user.dto";

/**
 * Lấy danh sách users (có phân trang, filter), và validate bằng Zod
 */
export async function getAllUsers(
  query: unknown = {}
): Promise<IUserListResponse> {
  const params = GetUsersSchema.parse(query);
  const data = await $get<IUserListResponse>("users", params);
  return IUserListResponseSchema.parse(data);
}

/**
 * Lấy chi tiết một user theo ID
 */
export async function getUserById(id: string): Promise<UserDto> {
  return $get<UserDto>(`users/${id}`);
}

/**
 * Tạo mới một user (admin)
 */
export async function createUser(
  payload: CreateUserDto
): Promise<UserDto> {
  return $post<UserDto>("users", payload);
}

/**
 * Cập nhật thông tin user (admin)
 */
export async function updateUser(
  id: string,
  dto: UpdateByAdminDto
): Promise<UserDto> {
  return $put<UserDto>(`users/${id}`, dto);
}

/**
 * Đổi mật khẩu cho user
 */
export async function changeUserPassword(
  id: string,
  dto: ChangePasswordDto
): Promise<void> {
  return $put<void>(`users/${id}/password`, dto);
}

/**
 * Cập nhật profile cho user
 */
export async function updateUserProfile(
  id: string,
  dto: UpdateProfileDto
): Promise<UserDto> {
  return $put<UserDto>(`users/${id}/profile`, dto);
}

/**
 * Xóa user
 */
export async function removeUser(id: string): Promise<void> {
  return $del<void>(`users/${id}`);
}

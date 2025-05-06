import { $get, $post, $put, $del } from "../share/api/apiHelpers";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { GetUsersSchema } from "./dto/get-users.dto";
import { UpdateByAdminDto } from "./dto/update-by-admin.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import {
  IUserListResponse,
  IUserListResponseSchema,
} from "./dto/user-list.dto";
import { UserDto } from "./dto/user.dto";

export class UsersApi {
  /** Lấy danh sách users (có phân trang, filter) */
  async getAll(query = {}) {
    const params = GetUsersSchema.parse(query);
    const data = await $get<IUserListResponse>("users", params);
    return IUserListResponseSchema.parse({ ...data });
  }

  /** Lấy chi tiết một user theo ID */
  async getById(id: string) {
    return await $get<UserDto>(`users/${id}`);
  }

  /** Tạo mới một user (admin) */
  async create(payload: UserDto) {
    return await $post<UserDto>("users", payload);
  }

  /** Cập nhật thông tin user (admin) */
  async update(id: string, dto: UpdateByAdminDto) {
    return await $put<UserDto>(`users/${id}`, dto);
  }

  /** Đổi mật khẩu cho user */
  async changePassword(id: string, dto: ChangePasswordDto) {
    return await $put<void>(`users/${id}/password`, dto);
  }

  /** Cập nhật profile cho user */
  async updateProfile(id: string, dto: UpdateProfileDto) {
    return await $put<UserDto>(`users/${id}/profile`, dto);
  }

  /** Xoá user */
  async remove(id: string) {
    return await $del<void>(`users/${id}`);
  }
}

export const usersApi = new UsersApi();

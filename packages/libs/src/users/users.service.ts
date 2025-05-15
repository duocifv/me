import { api } from "../share/api/apiClient";
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

class UserService {
  private usersApi = api.group("users");

  async getAllUsers(query: unknown = {}): Promise<IUserListResponse> {
    const params = GetUsersSchema.parse(query);
    return await this.usersApi.get<IUserListResponse>("", { params });
  }

  async getUserById(id: string): Promise<UserDto> {
    return this.usersApi.get<UserDto>(`${id}`);
  }

  async createUser(dto: CreateUserDto): Promise<UserDto> {
    return this.usersApi.post<UserDto>("", dto);
  }

  async updateUser(id: string, dto: UpdateByAdminDto): Promise<UserDto> {
    return this.usersApi.put<UserDto>(`${id}`, dto);
  }

  async changeUserPassword(id: string, dto: ChangePasswordDto): Promise<void> {
    return this.usersApi.put<void>(`${id}/password`, dto);
  }

  async updateUserProfile(id: string, dto: UpdateProfileDto): Promise<UserDto> {
    return this.usersApi.put<UserDto>(`${id}/profile`, dto);
  }

  async removeUser(id: string): Promise<void> {
    return this.usersApi.delete<void>(`${id}`);
  }
}

export const userService = new UserService();

import { api } from "../share/api/apiClient";
import { ValidationError } from "../share/api/zod-error";
import { uuidDto, uuidSchema } from "../share/schema/uuid";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { GetUsersSchema } from "./dto/get-users.dto";
import { UpdateByAdminDto } from "./dto/update-by-admin.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { IUserListResponse } from "./dto/user-list.dto";
import { UserDto } from "./dto/user.dto";

class UserService {
  private usersApi = api.group("users");

  async getAllUsers(query: unknown = {}): Promise<IUserListResponse> {
    const { data: params, success, error } = GetUsersSchema.safeParse(query);
    if (!success) {
      throw new ValidationError(error);
    }
    return await this.usersApi.get<IUserListResponse>("", { params });
  }

  async getUserById(uuid: uuidDto): Promise<UserDto> {
    const { data, success, error } = uuidSchema.safeParse(uuid);
    if (!success) {
      throw new ValidationError(error);
    }
    return this.usersApi.get<UserDto>(data);
  }

  async createUser(dto: CreateUserDto): Promise<UserDto> {
    return this.usersApi.post<UserDto>("", dto);
  }

  async updateUser(uuid: string, dto: UpdateByAdminDto): Promise<UserDto> {
    const { data, success, error } = uuidSchema.safeParse(uuid);
    if (!success) {
      throw new ValidationError(error);
    }
    return this.usersApi.put<UserDto>(data, dto);
  }

  async changeUserPassword(
    uuid: string,
    dto: ChangePasswordDto
  ): Promise<void> {
    const { data, success, error } = uuidSchema.safeParse(uuid);
    if (!success) {
      throw new ValidationError(error);
    }
    return this.usersApi.put<void>(`${data}/password`, dto);
  }

  async updateUserProfile(
    uuid: string,
    dto: UpdateProfileDto
  ): Promise<UserDto> {
    const { data, success, error } = uuidSchema.safeParse(uuid);
    if (!success) {
      throw new ValidationError(error);
    }
    return this.usersApi.put<UserDto>(`${data}/profile`, dto);
  }

  // async removeUser(id: string): Promise<void> {
  //   return this.usersApi.delete<void>(`${id}`);
  // }
}

export const userService = new UserService();

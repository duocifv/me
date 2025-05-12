import { api } from "../share/api/apiClient"; // Đảm bảo import ApiClient đã được cấu hình
import { ApiError } from "../share/api/error";
import { UserDto } from "../users/dto/user.dto";
import {
  ChangePasswordDto,
  ChangePasswordSchema,
} from "./dto/change-password.dto";
import { LoginDto, MeDto } from "./dto/login.dto";
import { SignInDto } from "./dto/sign-in.dto";

class AuthService {
  private authApi = api.group("auth");

  async login(dto: SignInDto): Promise<LoginDto> {
    const res = await this.authApi.post<LoginDto>("login", dto);
    if (res.accessToken) {
      this.authApi.setToken(res.accessToken);
    }
    return res;
  }

  async register(dto: SignInDto): Promise<UserDto> {
    return this.authApi.post<UserDto>("register", dto);
  }

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    const { success, data } = ChangePasswordSchema.safeParse(dto);
    if (!success) {
      throw new ApiError("not password", 400);
    }
    return this.authApi.post<void>("change-password", { data });
  }

  async getMe(): Promise<MeDto> {
    return this.authApi.get<MeDto>("me");
  }

  async logout(): Promise<void> {
    return this.authApi.delete<void>("logout", { credentials: "include" });
  }
}

export const authService = new AuthService();

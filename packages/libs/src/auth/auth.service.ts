import { api } from "../share/api/apiClient"; // Đảm bảo import ApiClient đã được cấu hình
import { ApiError } from "../share/api/errorHandler";
import { UserDto } from "../users/dto/user.dto";
import {
  ChangePasswordDto,
  ChangePasswordSchema,
} from "./dto/change-password.dto";
import { LoginDto, MeDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto, ResetPasswordTokenDto } from "./dto/reset-password";
import { SignInDto } from "./dto/sign-in.dto";

class AuthService {
  private authApi = api.group("auth");

  async login(dto: SignInDto): Promise<LoginDto> {
    const res = await this.authApi.post<LoginDto>("login", dto, {
      credentials: "include",
      useFingerprint: true,
    });
    if (res.accessToken) {
      api.storage.login();
      api.setToken(res.accessToken);
    }
    return res;
  }

  async register(dto: RegisterDto): Promise<UserDto> {
    return this.authApi.post<UserDto>("register", dto);
  }

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    const { success, data } = ChangePasswordSchema.safeParse(dto);
    if (!success) {
      throw new ApiError("not password", 400);
    }
    return this.authApi.post<void>("change-password", { data });
  }

  async resetPassword(dto: ResetPasswordTokenDto): Promise<void> {
    return this.authApi.post<void>("reset-password", dto);
  }

  async verifyEmail(token: string): Promise<void> {
    return this.authApi.post<void>("verify-email", { token });
  }

  async getMe(): Promise<MeDto | null> {
    try {
      const data = await this.authApi.get<MeDto>("me");
      api.storage.login();
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authApi.delete<void>("logout", {
        credentials: "include",
        useFingerprint: true,
      });
      api.clearToken();
      api.storage.logout();
      api.redirectLogin();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export const authService = new AuthService();

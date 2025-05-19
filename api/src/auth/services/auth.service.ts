import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { TokensService } from './tokens.service';
import { UsersService } from 'src/user/users.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserDto, UserWithPermissionsSchema } from 'src/user/dto/user.dto';
import { User } from 'src/user/entities/user.entity';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { JwtPayload } from '../interfaces/jwt-payload.type';
import { AccountSecurityService } from './account-security.service';
import { UserStatus } from 'src/user/dto/user-status.enum';
import axios from 'axios';
import { RecaptchaVerifyResponse } from '../interfaces/capcha.type';
import { SignInDto } from '../dto/sign-in.dto';
import { Token } from '../interfaces/token.type';

@Injectable()
export class AuthService {
  private readonly CAPTCHA_THRESHOLD = 3;
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
    private readonly accountSecurityService: AccountSecurityService,
  ) {}
  private async verifyCaptcha(token: string): Promise<void> {
    if (!token) {
      throw new BadRequestException('Vui lòng xác thực reCAPTCHA');
    }

    const secret = process.env.RECAPTCHA_SECRET;
    if (!secret) {
      throw new InternalServerErrorException(
        'Server chưa cấu hình reCAPTCHA_SECRET',
      );
    }

    const params = new URLSearchParams({
      secret,
      response: token,
    });

    try {
      const { data } = await axios.post<RecaptchaVerifyResponse>(
        'https://www.google.com/recaptcha/api/siteverify',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      if (!data.success) {
        throw new BadRequestException('reCAPTCHA không hợp lệ');
      }
    } catch (err: any) {
      // Nếu axios throw lỗi network hoặc tương tự
      throw new BadRequestException(`Lỗi reCAPTCHA: ${err.message}`);
    }
  }
  // So sánh mật khẩu plain text với hash
  private async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async fakeDelay() {
    return new Promise((resolve) => setTimeout(resolve, 500)); // delay 500ms
  }

  // Xác thực user với email và password, trả về user đã parse theo schema
  async validateUser(dto: SignInDto): Promise<UserDto> {
    const { email, password, captchaToken } = dto;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      await this.fakeDelay();
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // CAPTCHA sau 3 lần thất bại
    if (user.failedLoginAttempts >= this.CAPTCHA_THRESHOLD) {
      const token = captchaToken;
      if (!token) {
        throw new BadRequestException('Vui lòng xác thực reCAPTCHA');
      }
      await this.verifyCaptcha(token);
    }

    // Kiểm tra khóa tài khoản
    if (this.accountSecurityService.isLocked(user)) {
      throw new ForbiddenException(
        `Tài khoản bị khóa đến ${user.lockedUntil?.toISOString() ?? 'unknown'}`,
      );
    }

    // So mật khẩu
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      await this.accountSecurityService.handleFailedLogin(user);
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Đăng nhập thành công: reset counter
    await this.accountSecurityService.resetFailedLogin(user);

    return UserWithPermissionsSchema.parse(user);
  }

  // Đăng ký user mới
  async register(dto: CreateUserDto): Promise<UserDto> {
    const user = await this.usersService.create(dto);
    return user;
  }

  // Đăng nhập, tạo cặp token và trả về
  async signIn(user: User, fingerprint: string): Promise<Token> {
    return this.tokensService.generateTokenPair(user, fingerprint);
  }

  // Refresh lại access và refresh token
  async refreshTokens(
    refreshToken: string,
    deviceInfo: string,
  ): Promise<Token> {
    const payload = await this.tokensService.verifyRefreshToken(
      refreshToken,
      deviceInfo,
    );
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }
    // Quay vòng refresh token (rotate)
    return this.tokensService.rotateRefreshToken(payload.jti, user, deviceInfo);
  }

  // Đăng xuất (thu hồi refresh token)
  async logout(refreshToken: string, fingerprint: string): Promise<void> {
    if (!refreshToken || !fingerprint) {
      throw new UnauthorizedException('Token hoặc fingerprint không hợp lệ');
    }

    const payload = await this.tokensService.verifyRefreshToken(
      refreshToken,
      fingerprint,
    );

    return this.tokensService.revokeRefreshToken(payload.jti, fingerprint);
  }

  // Thay đổi mật khẩu user
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    return this.usersService.changePassword(userId, dto);
  }

  async getMe(userJwt: JwtPayload) {
    const user = await this.usersService.findById(userJwt.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.status !== UserStatus.active) {
      throw new ForbiddenException('User is not active');
    }
    const roles = user.roles?.map((role) => role.name) ?? [];

    return { user, roles };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email).catch(() => null);
    if (!user) return;

    // const token = randomBytes(32).toString('hex');
    // const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

    // user.resetPasswordToken = token;
    // user.resetPasswordExpires = expires;
    // await this.usersService.saveUser(user);

    // const resetLink = `https://your-app.com/reset-password?token=${token}`;
    // await this.mailService.sendMail({
    //   to: email,
    //   subject: 'Reset your password',
    //   text: `Click here to reset your password: ${resetLink}`,
    // });
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    if (!token || !newPassword) {
      throw new BadRequestException('Token and new password are required.');
    }

    const user = await this.usersService.findByResetToken(token);
    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new UnauthorizedException('Reset token is invalid or expired.');
    }

    user.password = await this.usersService.hashToken(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.usersService.saveUser(user);

    return { message: 'Password reset successful' };
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokensService } from './tokens.service';
import { UsersService } from 'src/user/users.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserDto, UserWithPermissionsSchema } from 'src/user/dto/user.dto';
import { User } from 'src/user/entities/user.entity';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AccountSecurityService } from './account-security.service';
import { UserStatus } from 'src/user/dto/user-status.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
    private readonly accountSecurityService: AccountSecurityService,
  ) {}

  // So sánh mật khẩu plain text với hash
  private async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Xác thực user với email và password, trả về user đã parse theo schema
  async validateUser(email: string, password: string): Promise<UserDto> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    if (this.accountSecurityService.isLocked(user)) {
      throw new ForbiddenException(
        `Tài khoản bị khóa đến ${user.lockedUntil?.toISOString() ?? 'unknown'}`,
      );
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return UserWithPermissionsSchema.parse(user);
  }

  // Đăng ký user mới
  async register(dto: CreateUserDto): Promise<UserDto> {
    const user = await this.usersService.create(dto);
    return user;
  }

  // Đăng nhập, tạo cặp token và trả về
  async signIn(
    user: User,
    fingerprint: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    return this.tokensService.generateTokenPair(user, fingerprint);
  }

  // Refresh lại access và refresh token
  async refreshTokens(
    refreshToken: string,
    deviceInfo: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
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

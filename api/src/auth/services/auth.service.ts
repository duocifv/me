import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { UsersService } from 'src/user/users.service';
import bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserDto, UserWithPermissionsSchema } from 'src/user/dto/user.dto';
import { User } from 'src/user/entities/user.entity';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  private async compareToken(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  async validateUser(email: string, password: string): Promise<UserDto> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    const match = await this.compareToken(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return UserWithPermissionsSchema.parse(user);
  }

  async register(dto: CreateUserDto): Promise<UserDto> {
    const user = await this.usersService.create(dto);
    return user;
  }

  async signIn(
    user: User,
    deviceInfo: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    return await this.tokensService.generateTokenPair(user, deviceInfo);
  }

  async refreshTokens(
    token: string,
    deviceInfo: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    const payload = await this.tokensService.verifyRefreshToken(
      token,
      deviceInfo,
    );
    console.log('payload', payload, token, deviceInfo);
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    return await this.tokensService.rotateRefreshToken(
      payload.jti,
      user,
      deviceInfo,
    );
  }

  async logout(token?: string, deviceInfo?: string): Promise<void> {
    if (!token || !deviceInfo) {
      throw new UnauthorizedException('Không hợp lệ');
    }
    return this.tokensService.revokeRefreshToken(token, deviceInfo);
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    return this.usersService.changePassword(id, dto);
  }
}

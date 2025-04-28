import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { UsersService } from 'src/user/users.service';
import { SignInDto } from './dto/sign-in.dto';
import bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserDto, UserSchema } from 'src/user/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  private async compareToken(
    storedToken: string,
    rawToken: string,
  ): Promise<boolean> {
    return bcrypt.compare(rawToken, storedToken);
  }

  async validateUser(email: string, pass: string): Promise<UserDto> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    const match = await this.compareToken(pass, user.password);
    if (!match) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return UserSchema.parse(user);
  }

  async register(dto: CreateUserDto): Promise<UserDto> {
    const user = await this.usersService.create(dto);
    return user;
  }

  async signIn(
    dto: SignInDto,
    ipAddress: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    const user = await this.usersService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return await this.tokensService.generateTokenPair(user, ipAddress);
  }

  async refreshTokens(
    token: string,
    ipAddress: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    const payload = await this.tokensService.verifyRefreshToken(
      token,
      ipAddress,
    );
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    return await this.tokensService.rotateRefreshToken(
      payload.jti,
      user,
      ipAddress,
    );
  }

  async logout(token?: string, ipAddress?: string): Promise<void> {
    if (!token || !ipAddress) {
      throw new UnauthorizedException('Không hợp lệ');
    }
    return this.tokensService.revokeRefreshToken(token, ipAddress);
  }
}

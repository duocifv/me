import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { UsersService } from 'src/user/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  /**
   * Đăng nhập: validate user, sinh access + refresh token,
   * gán cookie cho refresh token và trả về access token.
   */
  async signIn(dto: SignInDto) {
    const user = await this.usersService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return await this.tokensService.generateTokenPair(user);
  }

  /**
   * Refresh token: đọc cookie, verify, rotate token,
   * gán lại cookie mới và trả về access token mới.
   */
  async refreshTokens(token: string) {
    const payload = await this.tokensService.verifyRefreshToken(token);
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    return await this.tokensService.rotateRefreshToken(payload.jti, user);
  }

  /**
   * Logout: revoke refresh token và xóa cookie.
   */
  async logout(req: FastifyRequest, res: FastifyReply) {
    const token = req.cookies.refreshToken;
    if (token) {
      await this.tokensService.revokeRefreshToken(token);
    }
    res.clearCookie('refreshToken', { path: '/' });
    return { message: 'Đăng xuất thành công' };
  }
}

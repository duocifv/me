import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { UsersService } from 'src/user/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  /**
   * Đăng nhập: validate user, sinh access + refresh token,
   * gán cookie cho refresh token và trả về access token.
   */
  async signIn(dto: SignInDto, res: FastifyReply) {
    const user = await this.usersService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const { accessToken, refreshToken, expiresAt } =
      await this.tokensService.generateTokenPair(user);

    res.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      signed: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: expiresAt.getTime() - Date.now(),
    });

    return { accessToken };
  }

  /**
   * Refresh token: đọc cookie, verify, rotate token,
   * gán lại cookie mới và trả về access token mới.
   */
  async refreshTokens(req: FastifyRequest, res: FastifyReply) {
    const token = req.cookies.refreshToken;
    if (!token) {
      throw new UnauthorizedException('Không tìm thấy refresh token');
    }

    const payload = this.tokensService.verifyRefreshToken(token);
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt,
    } = await this.tokensService.rotateRefreshToken(payload.jti, user);

    // Gán cookie HttpOnly mới
    res.setCookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: expiresAt.getTime() - Date.now(),
    });

    return { accessToken };
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

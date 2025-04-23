import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { TokensService } from './tokens.service';
import { SignInDto } from './dto/sign-in.dto';
import { UsersService } from 'src/user/users.service';

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
  async signIn(dto: SignInDto, res: Response) {
    const user = await this.usersService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const { accessToken, refreshToken, expiresAt } =
      await this.tokensService.generateTokenPair(user);

    // Gán cookie HttpOnly cho refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
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
  async refreshTokens(req: Request, res: Response) {
    const token = req.cookies['refreshToken'];
    if (!token) {
      throw new UnauthorizedException('Không tìm thấy refresh token');
    }

    const payload = await this.tokensService.verifyRefreshToken(token);
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
    res.cookie('refreshToken', newRefreshToken, {
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
  async logout(req: Request, res: Response) {
    const token = req.cookies['refreshToken'];
    if (token) {
      await this.tokensService.revokeRefreshToken(token);
    }
    res.clearCookie('refreshToken', { path: '/' });
    return { message: 'Đăng xuất thành công' };
  }
}

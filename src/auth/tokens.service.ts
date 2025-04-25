// src/auth/tokens.service.ts

import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { RefreshTokenPayload } from './dto/sign-in.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TokensService {
  // Thời gian sống của access & refresh token
  private readonly ACCESS_TOKEN_EXPIRES_IN = '15m';
  private readonly REFRESH_TOKEN_EXPIRES_IN = '30d';
  private readonly MAX_USAGE_COUNT = 5;

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly rtRepo: Repository<RefreshToken>,
  ) {}

  /**
   * Sinh cặp Access + Refresh token:
   * - Access token JWT ngắn hạn
   * - Refresh token JWT dài hạn, kèm jti (UUID), lưu DB
   */
  async generateTokenPair(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    // 1. Access token
    const accessToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: process.env.JWT_ACCESS_SECRET!,
        expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      },
    );

    // 2. Refresh token
    const jti = randomUUID();
    const refreshToken = this.jwtService.sign(
      { sub: user.id, jti },
      {
        secret: process.env.JWT_REFRESH_SECRET!,
        expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      },
    );

    // 3. Tính expiresAt cho DB
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // 4. Lưu jti vào DB để có thể revoke/rotate sau này
    try {
      await this.rtRepo.save(
        this.rtRepo.create({
          token: jti,
          user,
          expiresAt,
          usageCount: 0,
        }),
      );
    } catch {
      // Nếu lưu DB thất bại, throw 500
      throw new InternalServerErrorException(
        'Không tạo được refresh token record',
      );
    }

    return { accessToken, refreshToken, expiresAt };
  }

  /**
   * Verify refresh token (đồng bộ) và ép kiểu payload.
   * Không lưu bất cứ state nào ở đây.
   */
  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    let payload: RefreshTokenPayload;

    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(token, {
        secret: process.env.JWT_REFRESH_SECRET!,
      });
    } catch {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    // Kiểm tra jti trong DB
    const stored = await this.rtRepo.findOneBy({ token: payload.jti });
    if (!stored) {
      throw new UnauthorizedException(
        'Refresh token không tồn tại hoặc đã bị thu hồi',
      );
    }

    return payload;
  }

  /**
   * Rotate refresh token:
   * - Kiểm tra tồn tại jti trong DB, chưa expired, và usageCount chưa vượt
   * - Tăng usageCount, xóa record cũ (strict rotation), rồi sinh lại cặp mới
   */
  async rotateRefreshToken(
    oldJti: string,
    user: User,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    const rt = await this.rtRepo.findOne({
      where: { token: oldJti },
    });

    if (!rt) {
      throw new UnauthorizedException('Refresh token đã bị thu hồi');
    }
    if (rt.expiresAt < new Date()) {
      await this.rtRepo.delete({ token: oldJti });
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }
    if (rt.usageCount >= this.MAX_USAGE_COUNT) {
      await this.rtRepo.delete({ token: oldJti });
      throw new UnauthorizedException('Refresh token vượt giới hạn sử dụng');
    }

    // Tăng usageCount
    rt.usageCount += 1;
    await this.rtRepo.save(rt);

    // Xóa strict-rotate: không thể dùng lại
    await this.rtRepo.delete({ token: oldJti });

    // Sinh cặp token mới
    return this.generateTokenPair(user);
  }

  /**
   * Revoke (thu hồi) refresh token:
   * - Xóa jti record trong DB để token không thể dùng lại
   */
  async revokeRefreshToken(token: string): Promise<void> {
    const { jti } = await this.verifyRefreshToken(token);
    await this.rtRepo.delete({ token: jti });
  }
}

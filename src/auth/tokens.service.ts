import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TokensService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly rtRepo: Repository<RefreshToken>,
  ) {}

  /**
   * Sinh cặp Access + Refresh token, lưu jti vào DB.
   */
  async generateTokenPair(user: User) {
    // Access token ngắn hạn
    const accessToken = this.jwtService.sign(
      { sub: user.id },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );

    // Refresh token dài hạn + jti
    const jti = randomUUID();
    const refreshToken = this.jwtService.sign(
      { sub: user.id, jti },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '30d' },
    );
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Lưu jti & expires vào DB
    const rtEntity = this.rtRepo.create({
      token: jti,
      user,
      expiresAt,
      usageCount: 0,
    });
    await this.rtRepo.save(rtEntity);

    return { accessToken, refreshToken, expiresAt };
  }

  /**
   * Verify refresh token (JWT + tồn tại jti).
   */
  async verifyRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      }) as { sub: string; jti: string; exp: number };
    } catch (err) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }

  /**
   * Xoay (rotate) refresh token: kiểm tra usageCount, expiresAt,
   * tăng usageCount, xóa record cũ (strict rotation), rồi sinh cặp mới.
   */
  async rotateRefreshToken(oldJti: string, user: User) {
    const rt = await this.rtRepo.findOne({
      where: { token: oldJti },
      relations: ['user'],
    });
    if (!rt || rt.expiresAt < new Date() || rt.usageCount >= 5) {
      // quá hạn hoặc vượt rate
      throw new UnauthorizedException('Refresh token đã bị thu hồi');
    }

    // Tăng counter
    rt.usageCount += 1;
    await this.rtRepo.save(rt);

    // Xóa strict rotation (nếu muốn)
    await this.rtRepo.delete({ token: oldJti });

    // Sinh cặp token mới
    return this.generateTokenPair(user);
  }

  /**
   * Revoke refresh token: xóa khỏi DB
   */
  async revokeRefreshToken(token: string) {
    const payload = await this.verifyRefreshToken(token);
    await this.rtRepo.delete({ token: payload.jti });
  }
}

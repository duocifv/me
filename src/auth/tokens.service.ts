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
import bcrypt from 'bcryptjs';

@Injectable()
export class TokensService {
  private readonly ACCESS_TOKEN_EXPIRES_IN = '15m';
  private readonly REFRESH_TOKEN_EXPIRES_IN = '30d';
  private readonly MAX_USAGE_COUNT = 5;

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly rtRepo: Repository<RefreshToken>,
  ) {}

  private async hashToken(token: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(token, saltRounds);
  }

  private async compareToken(
    storedToken: string,
    rawToken: string,
  ): Promise<boolean> {
    return bcrypt.compare(rawToken, storedToken);
  }

  async generateTokenPair(
    user: User,
    ipAddress: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    const accessToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: process.env.JWT_ACCESS_SECRET!,
        expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      },
    );

    const jti = randomUUID();
    const refreshToken = this.jwtService.sign(
      { sub: user.id, jti },
      {
        secret: process.env.JWT_REFRESH_SECRET!,
        expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      },
    );

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    try {
      await this.rtRepo.save(
        this.rtRepo.create({
          id: jti,
          user,
          expiresAt,
          usageCount: 0,
          ipAddress,
        }),
      );
    } catch {
      throw new InternalServerErrorException(
        'Không tạo được refresh token record',
      );
    }

    return { accessToken, refreshToken, expiresAt };
  }

  async verifyRefreshToken(
    token: string,
    ipAddress: string,
  ): Promise<RefreshTokenPayload> {
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
    const stored = await this.rtRepo.findOneBy({ id: payload.jti });
    if (!stored) {
      throw new UnauthorizedException(
        'Refresh token không tồn tại hoặc đã bị thu hồi',
      );
    }

    if (stored.ipAddress !== ipAddress) {
      throw new UnauthorizedException('Địa chỉ IP không hợp lệ');
    }

    return payload;
  }

  async rotateRefreshToken(
    oldJti: string,
    user: User,
    ipAddress: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    const rt = await this.rtRepo.findOne({
      where: { id: oldJti },
    });

    if (!rt) {
      throw new UnauthorizedException('Refresh token đã bị thu hồi');
    }
    if (rt.expiresAt < new Date()) {
      await this.rtRepo.delete({ id: oldJti });
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }
    if (rt.usageCount >= this.MAX_USAGE_COUNT) {
      await this.rtRepo.delete({ id: oldJti });
      throw new UnauthorizedException('Refresh token vượt giới hạn sử dụng');
    }

    if (rt.ipAddress !== ipAddress) {
      throw new UnauthorizedException('Địa chỉ IP không hợp lệ');
    }

    rt.usageCount += 1;
    await this.rtRepo.save(rt);

    await this.rtRepo.delete({ id: oldJti });

    return this.generateTokenPair(user, ipAddress);
  }

  async revokeRefreshToken(token: string, ipAddress: string): Promise<void> {
    const { jti } = await this.verifyRefreshToken(token, ipAddress);
    await this.rtRepo.delete({ id: jti });
  }
}

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
import { AppConfigService } from 'src/shared/config/config.service';

@Injectable()
export class TokensService {
  private readonly MAX_USAGE_COUNT = 5;

  constructor(
    private readonly jwtService: JwtService,
    private readonly cfg: AppConfigService,
    @InjectRepository(RefreshToken)
    private readonly rtRepo: Repository<RefreshToken>,
  ) {}

  async generateTokenPair(
    user: User,
    ipAddress: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    const iss = this.cfg.token.issuer;
    const aud = this.cfg.token.audience;
    const now = Math.floor(Date.now() / 1000);
    const roles = Array.isArray(user.roles) ? user.roles : [];
    const permissions = roles
      .flatMap((role) => role.permissions || [])
      .map((perm) => perm.name);
    const roleNames = roles.map((role) => role.name);

    // === Access Token Payload ===
    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      roles: roleNames,
      permissions,
      iss,
      aud,
      iat: now,
      nbf: now,
    };

    const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
      privateKey: this.cfg.token.privateKey,
      algorithm: 'RS256',
      expiresIn: this.cfg.token.accessToken.expires,
    });

    // === Refresh Token Payload ===
    const jti = randomUUID();

    const refreshTokenPayload = {
      sub: user.id,
      jti,
      iss,
      aud,
      iat: now,
      nbf: now,
    };

    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      privateKey: this.cfg.token.privateKey,
      algorithm: 'RS256',
      expiresIn: this.cfg.token.refreshToken.expires,
    });

    // === Lưu vào DB ===
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
    } catch (error) {
      console.error('Failed to save refresh token:', error);
      throw new InternalServerErrorException(
        'Không tạo được refresh token record',
      );
    }

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  async verifyRefreshToken(
    token: string,
    ipAddress: string,
  ): Promise<RefreshTokenPayload> {
    let payload: RefreshTokenPayload;

    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(token, {
        publicKey: this.cfg.token.publicKey,
        algorithms: ['RS256'],
      });
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token đã hết hạn');
      }
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

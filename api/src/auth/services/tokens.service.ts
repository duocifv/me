import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID, createHash } from 'crypto';
import { User } from 'src/user/entities/user.entity';
import { AppConfigService } from 'src/shared/config/config.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RefreshTokenPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class TokensService {
  private readonly MAX_USAGE_COUNT = 5;

  constructor(
    private readonly jwtService: JwtService,
    private readonly cfg: AppConfigService,
    @InjectRepository(RefreshToken)
    private readonly rtRepo: Repository<RefreshToken>,
  ) {}

  /** Hash token bằng SHA-256 để lưu DB, tránh lưu token gốc */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /** Tạo Access Token (RS256) */
  async generateAccessToken(user: User): Promise<string> {
    const {
      issuer: iss,
      audience: aud,
      accessToken,
      privateKey,
    } = this.cfg.token;
    const now = Math.floor(Date.now() / 1000);

    // Lấy roles và permissions (nếu có)
    // const roles = Array.isArray(user.roles) ? user.roles : [];
    // const permissions = roles
    //   .flatMap((r) => r.permissions || [])
    //   .map((p) => p.name);
    // const roleNames = roles.map((r) => r.name);

    // email: user.email,
    // roles: roleNames,
    // permissions,

    const payload = {
      sub: user.id,
      iss,
      aud,
      iat: now,
      nbf: now,
    };

    return this.jwtService.signAsync(payload, {
      privateKey,
      algorithm: 'RS256',
      expiresIn: accessToken.expires,
    });
  }

  /** Tạo Refresh Token (RS256) */
  async generateRefreshToken(
    user: User,
  ): Promise<{ token: string; jti: string }> {
    const {
      issuer: iss,
      audience: aud,
      refreshToken,
      privateKey,
    } = this.cfg.token;
    const now = Math.floor(Date.now() / 1000);
    const jti = randomUUID();

    const payload: RefreshTokenPayload = {
      sub: user.id,
      jti,
      iss,
      aud,
      iat: now,
      nbf: now,
    };

    const token = await this.jwtService.signAsync(payload, {
      privateKey,
      algorithm: 'RS256',
      expiresIn: refreshToken.expires,
    });

    return { token, jti };
  }

  /**
   * Lưu refresh token hash vào DB kèm fingerprint để kiểm soát thiết bị
   * @param userId ID user
   * @param fingerprint Chuỗi fingerprint thiết bị
   * @param jti JWT ID của refresh token
   * @param refreshToken Refresh token gốc
   */
  async saveRefreshToken(
    userId: string,
    fingerprint: string,
    jti: string,
    refreshToken: string,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 ngày
    const tokenHash = this.hashToken(refreshToken);
    await this.rtRepo.save(
      this.rtRepo.create({
        id: jti,
        user: { id: userId },
        expiresAt,
        usageCount: 0,
        fingerprint,
        tokenHash,
        revoked: false,
      }),
    );
  }

  /** Tạo cặp Access + Refresh Token và lưu refresh token */
  async generateTokenPair(
    user: User,
    fingerprint: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    const accessToken = await this.generateAccessToken(user);
    const { token: refreshToken, jti } = await this.generateRefreshToken(user);
    await this.saveRefreshToken(user.id, fingerprint, jti, refreshToken);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  /**
   * Xác thực refresh token:
   * - Verify chữ ký, kiểm tra tồn tại token
   * - So sánh hash token
   * - Kiểm tra revoked, fingerprint, expire, usageCount
   */
  async verifyRefreshToken(
    token: string,
    fingerprint: string,
  ): Promise<RefreshTokenPayload> {
    let payload: RefreshTokenPayload;

    // 1. Giải mã token và kiểm tra chữ ký
    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        publicKey: this.cfg.token.publicKey,
        algorithms: ['RS256'],
      });
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token đã hết hạn');
      }
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    // 2. Kiểm tra jti tồn tại
    if (!payload?.jti) {
      throw new UnauthorizedException('Refresh token thiếu định danh jti');
    }

    // 3. Truy vấn refresh token từ DB
    const stored = await this.rtRepo.findOneBy({ id: payload.jti });
    if (!stored) {
      throw new UnauthorizedException(
        'Refresh token không tồn tại hoặc đã bị thu hồi',
      );
    }

    // 4. Kiểm tra token hash trùng khớp
    const tokenHash = this.hashToken(token);
    if (stored.tokenHash !== tokenHash) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã bị thay đổi',
      );
    }

    // 5. Kiểm tra trạng thái token đã bị thu hồi chưa
    if (stored.revoked) {
      throw new ForbiddenException('Refresh token đã bị thu hồi');
    }

    // 6. Kiểm tra fingerprint (ràng buộc với thiết bị)
    if (stored.fingerprint !== fingerprint) {
      throw new ForbiddenException(
        'Thiết bị không hợp lệ hoặc không trùng khớp',
      );
    }

    // 7. Kiểm tra hạn sử dụng
    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }

    // 8. Kiểm tra số lần sử dụng
    if (stored.usageCount >= this.MAX_USAGE_COUNT) {
      throw new ForbiddenException('Refresh token vượt quá giới hạn sử dụng');
    }

    return payload;
  }

  /**
   * Xoay (rotate) refresh token:
   * - Tăng usageCount cho token cũ
   * - Xóa token cũ (để không tái sử dụng)
   * - Tạo token mới
   */
  async rotateRefreshToken(
    oldJti: string,
    user: User,
    fingerprint: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    const rt = await this.rtRepo.findOneBy({ id: oldJti });

    if (!rt) {
      throw new UnauthorizedException(
        'Refresh token đã bị thu hồi hoặc không tồn tại',
      );
    }

    if (rt.expiresAt < new Date()) {
      await this.rtRepo.delete({ id: oldJti });
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }

    if (rt.usageCount >= this.MAX_USAGE_COUNT) {
      await this.rtRepo.delete({ id: oldJti });
      throw new UnauthorizedException('Refresh token vượt giới hạn sử dụng');
    }

    if (rt.fingerprint !== fingerprint) {
      throw new UnauthorizedException('Thiết bị không hợp lệ');
    }

    // Tăng usageCount
    rt.usageCount += 1;
    await this.rtRepo.save(rt);

    // Xóa refresh token cũ để không thể tái sử dụng (optional)
    await this.rtRepo.delete({ id: oldJti });

    // Tạo cặp token mới
    return this.generateTokenPair(user, fingerprint);
  }

  /** Tăng usageCount mỗi lần dùng refresh token (giới hạn abuse) */
  async incrementUsageCount(jti: string): Promise<void> {
    await this.rtRepo.increment({ id: jti }, 'usageCount', 1);
  }

  /** Thu hồi refresh token (đánh dấu revoked) */
  async revokeRefreshToken(jti: string, fingerprint: string): Promise<void> {
    const token = await this.rtRepo.findOneBy({ id: jti });
    console.log('refreshToken', token);
    if (!token) {
      throw new NotFoundException('Refresh token không tồn tại');
    }

    if (token.fingerprint !== fingerprint) {
      throw new ForbiddenException('Thiết bị không hợp lệ');
    }

    if (token.revoked) {
      // Token đã bị thu hồi trước đó, có thể log hoặc bỏ qua
      return;
    }

    await this.rtRepo.update({ id: jti }, { revoked: true });
  }
}

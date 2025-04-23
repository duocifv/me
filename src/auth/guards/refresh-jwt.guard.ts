// src/auth/guards/refresh-jwt.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for protecting routes that require a valid Refresh JWT.
 * Reads token from HttpOnly cookie 'refreshToken'.
 */
@Injectable()
export class RefreshJwtGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }

  /**
   * Optionally override canActivate to apply base behavior (e.g., rate limiting can be applied separately).
   */
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  /**
   * Customize request handling: throw Unauthorized if token invalid or absent.
   */
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Refresh token không hợp lệ');
    }
    return user;
  }
}

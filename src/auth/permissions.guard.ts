// src/auth/permissions.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { SCOPES_KEY } from './scopes.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService, // để verify token và get payload.roles/payload.permissions/payload.scopes
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    // Lấy metadata
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];
    const requiredScopes =
      this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    // Nếu không có decorator nào gắn, mặc định cho phép
    if (requiredPermissions.length === 0 && requiredScopes.length === 0) {
      return true;
    }

    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }
    const [, token] = authHeader.split(' ');
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Kiểm tra permissions
    const userPermissions: string[] = payload.permissions || [];
    const hasAllPerms = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    );
    if (!hasAllPerms) {
      throw new ForbiddenException(
        `Missing required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    // Kiểm tra scopes
    const userScopes: string[] = payload.scopes || [];
    const hasAllScopes = requiredScopes.every((s) => userScopes.includes(s));
    if (!hasAllScopes) {
      throw new ForbiddenException(
        `Missing required scopes: ${requiredScopes.join(', ')}`,
      );
    }

    // Gán user payload vào request nếu cần
    req.user = payload;
    return true;
  }
}

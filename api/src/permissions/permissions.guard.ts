// permissions.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/user/entities/user.entity';
import { PermissionName } from './permission.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Lấy metadata permissions từ decorator
    const requiredPermissions = this.reflector.get<PermissionName[]>(
      'permissions',
      context.getHandler(),
    );
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 2. Lấy user từ request (đã được JwtStrategy gán)
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const permissions = user.roles
      .flatMap((r) => r.permissions || [])
      .map((p) => p.name);

    //3. Kiểm tra user và mảng permissions phải tồn tại
    if (!user || !Array.isArray(permissions)) {
      throw new ForbiddenException('No permissions found on user');
    }

    // 4. Kiểm tra xem user có đủ tất cả requiredPermissions không
    const hasAll = requiredPermissions.every((perm) =>
      permissions.includes(perm),
    );

    if (!hasAll) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

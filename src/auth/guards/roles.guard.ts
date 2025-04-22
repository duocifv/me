// src/auth/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(
      ROLES_KEY,
      ctx.getHandler(),
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // no roles metadata, allow
    }

    const { user } = ctx.switchToHttp().getRequest();
    if (!user || !user.roles) {
      throw new ForbiddenException('User has no roles');
    }

    const hasRole = user.roles.some((role: Role) =>
      requiredRoles.includes(role),
    );
    if (!hasRole) {
      throw new ForbiddenException(
        `Requires one of roles [${requiredRoles.join(', ')}]`,
      );
    }
    return true;
  }
}

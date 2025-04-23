// src/auth/guards/access-jwt.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for protecting routes with Access JWT.
 * Reads token from Authorization: Bearer <token> header.
 */
@Injectable()
export class AccessJwtGuard extends AuthGuard('jwt') {}

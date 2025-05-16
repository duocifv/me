// src/auth/strategies/local.strategy.ts

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { FastifyRequest } from 'fastify';
import { SignInDto } from '../dto/sign-in.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true, // Cho phép nhận req
    });
  }

  // validate sẽ nhận req, email, password
  async validate(
    req: FastifyRequest,
    email: string,
    password: string,
  ): Promise<any> {
    const { captchaToken } = req.body as Partial<SignInDto>;

    try {
      const user = await this.authService.validateUser({
        email,
        password,
        captchaToken,
      });

      if (!user) {
        throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
      }

      return user;
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof ForbiddenException
      ) {
        throw new UnauthorizedException(err.message);
      }

      throw err;
    }
  }
}

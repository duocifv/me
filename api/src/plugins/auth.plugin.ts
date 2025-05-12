import fp from 'fastify-plugin';
import type { FastifyRequest, FastifyReply } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import { UnauthorizedException } from '@nestjs/common';

declare module 'fastify' {
  interface FastifyReply {
    setRefreshToken(refreshToken: string, expiresAt: Date): this;
  }
  interface FastifyRequest {
    getRefreshToken(): string;
  }
  interface FastifyRequest {
    getIpAddress(): string;
    getRefreshToken(): string;
  }
}

export const authPlugin = fp((fastify) => {
  fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET! || '121212',
    parseOptions: {},
  });

  fastify.decorateReply(
    'setRefreshToken',
    function (this: FastifyReply, token: string, expiresAt: Date) {
      const maxAge = expiresAt.getTime() - Date.now();

      return this.setCookie('refreshToken', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: 'auth/token',
        maxAge,
        signed: true,
      });
    },
  );

  fastify.decorateRequest('getRefreshToken', function (this: FastifyRequest) {
    const signed = this.cookies?.refreshToken;
    if (!signed) {
      throw new UnauthorizedException('Missing refresh token cookie');
    }

    const { valid, value } = this.unsignCookie(signed);
    if (!valid) {
      throw new UnauthorizedException('Invalid refresh token signature');
    }
    return value;
  });

  fastify.decorateReply('clearRefreshToken', function (this: FastifyReply) {
    return this.clearCookie('refreshToken', {
      path: 'auth/token',
      signed: true,
    });
  });
  fastify.decorateRequest(
    'getIpAddress',
    function (this: FastifyRequest): string {
      let ipAddress: string = '';

      if (typeof this.headers['x-forwarded-for'] === 'string') {
        ipAddress = this.headers['x-forwarded-for'].split(',')[0];
      } else if (typeof this.ip === 'string') {
        ipAddress = this.ip;
      }
      return ipAddress;
    },
  );
});

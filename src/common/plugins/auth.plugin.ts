import fp from 'fastify-plugin';
import type { FastifyRequest, FastifyReply } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import { UnauthorizedException } from '@nestjs/common';

declare module 'fastify' {
  interface FastifyReply {
    /** Ghi cookie refreshToken đã ký */
    setRefreshToken(refreshToken: string, expiresAt: Date): this;
  }
  interface FastifyRequest {
    /** Đọc & verify cookie refreshToken ký */
    getRefreshToken(): string;
  }
}

export const authPlugin = fp((fastify) => {
  // đăng ký cookie plugin với secret để ký/giải
  fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET! || '121212',
    parseOptions: {},
  });

  // decorator trên reply để set cookie đã ký
  fastify.decorateReply(
    'setRefreshToken',
    function (this: FastifyReply, token: string, expiresAt: Date) {
      const maxAge = expiresAt.getTime() - Date.now();
      return this.setCookie('refreshToken', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge,
        signed: true,
      });
    },
  );

  // decorator trên request để get & verify cookie đã ký
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
});

import fp from 'fastify-plugin';
import type { FastifyRequest, FastifyReply } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import { UnauthorizedException } from '@nestjs/common';
import { UAParser } from 'ua-parser-js';

declare module 'fastify' {
  interface FastifyReply {
    setRefreshToken(refreshToken: string, expiresAt: Date): this;
  }
  interface FastifyRequest {
    getIpAddress(): string;
    getRefreshToken(): string;
    getDeviceInfo(): string;
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
     const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000); 
     
      return this.setCookie('refreshToken', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
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
      path: '/',
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
  fastify.decorateRequest('getDeviceInfo', function (this: FastifyRequest): string {
    const userAgent = this.headers['user-agent'] || '';
    const parser = new UAParser();
    parser.setUA(userAgent);
    const result = parser.getResult();
    return `${result.browser.name} on ${result.os.name}`;
  });
});

import fp from 'fastify-plugin';
import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import { UnauthorizedException } from '@nestjs/common';
import { UAParser } from 'ua-parser-js';

// Extend interfaces
declare module 'fastify' {
  interface FastifyReply {
    setCookieRefreshToken(refreshToken: string, expiresAt: Date, cookieName?: string): this;
    clearCookieRefreshToken(cookieName?: string): this;
  }
  interface FastifyRequest {
    getCookieIpAddress(cookieName?: string): string;
    getCookieRefreshToken(cookieName?: string): string;
    getCookieDeviceInfo(): string;
    getDeviceFingerprint(): string;
  }
}

export const authPlugin = fp((fastify: FastifyInstance) => {
  // We won't use cookie signing because JWT has its own signature
  // Common cookie options
  const cookieSecret = process.env.COOKIE_SECRET;
  if (!cookieSecret) {
    throw new Error('COOKIE_SECRET environment variable is not set');
  }

  const isProd = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true as const,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    secure: isProd, // phải là true nếu dùng SameSite: 'none'
    path: '/',
  };

  fastify.register(fastifyCookie, {
    secret: cookieSecret,
    parseOptions: {},
  });

  // Attach method to set refresh token
  fastify.decorateReply(
    'setCookieRefreshToken',
    function (
      this: FastifyReply,
      token: string,
      expiresAt: Date,
      cookieName?: string,
    ) {
      const name = cookieName ? `token-${cookieName}`: 'refresh_token';
      const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
      this.clearCookie(name, { ...cookieOptions, maxAge: 0 });
      return this.setCookie(name, encodeURIComponent(token), {
        ...cookieOptions,
        maxAge,
      });
    },
  );

  // Attach method to clear refresh token
  fastify.decorateReply(
    'clearCookieRefreshToken',
    function (this: FastifyReply, cookieName?: string) {
      const name = cookieName ? `token-${cookieName}`: 'refresh_token';
      return this.clearCookie(name, {
        ...cookieOptions,
        maxAge: 0,
      });
    },
  );

  // Extract JWT refresh token from cookie (no cookie-signing)
  fastify.decorateRequest(
    'getCookieRefreshToken',
    function (this: FastifyRequest, cookieName?: string) {
      const name = cookieName ? `token-${cookieName}`: 'refresh_token';
      const raw = this.cookies?.[name];
      if (!raw) {
        throw new UnauthorizedException('Missing refresh token cookie');
      }
      return decodeURIComponent(raw);
    },
  );

  // Extract IP address
  fastify.decorateRequest(
    'getCookieIpAddress',
    function (this: FastifyRequest): string {
      const xForwardedFor = this.headers['x-forwarded-for'];
      if (typeof xForwardedFor === 'string') {
        return xForwardedFor.split(',')[0].trim();
      }
      return this.ip;
    },
  );

  // Parse device info from user-agent
  fastify.decorateRequest(
    'getCookieDeviceInfo',
    function (this: FastifyRequest): string {
      const userAgent = this.headers['user-agent'] || 'unknown';
      const parser = new UAParser(userAgent);
      const result = parser.getResult();
      const browser = result.browser.name || 'Unknown Browser';
      const os = result.os.name || 'Unknown OS';
      return `${browser} on ${os}`;
    },
  );

  fastify.decorateRequest(
    'getDeviceFingerprint',
    function (this: FastifyRequest): string {
      const fingerprint = this.headers['x-device-fingerprint'];
      if (!fingerprint || typeof fingerprint !== 'string') {
        return 'unknown_fingerprint';
      }
      return fingerprint;
    },
  );
});

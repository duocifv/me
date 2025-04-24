import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';

export const cookiePlugin = fp((fastify) => {
  fastify.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'my-secret',
    parseOptions: {},
  });
});

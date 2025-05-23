import helmet from '@fastify/helmet';
import { FastifyInstance } from 'fastify';

const helmetConfig = {
  global: true,
  hidePoweredBy: true,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
};

export default async function securityHelmet(app) {
  await app.register(helmet, helmetConfig);

  // const fastifyInstance = app.getHttpAdapter().getInstance();
  // fastifyInstance.addHook(
  //   'onSend',
  //   (request, reply, payload: string | Buffer) => {
  //     reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  //     reply.header(
  //       'Permissions-Policy',
  //       'geolocation=(), microphone=(), camera=()',
  //     );
  //     return payload;
  //   },
  // );
}

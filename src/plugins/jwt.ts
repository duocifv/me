import fp from 'fastify-plugin';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import jwt from '@fastify/jwt';

// Plugin đăng ký JWT cho toàn bộ ứng dụng Fastify
export default fp(async (fastify: FastifyInstance) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

  fastify.register(jwt, {
    secret: JWT_SECRET,
    sign: {
      expiresIn: '1h', // Bạn có thể thay đổi theo nhu cầu
    },
  });

  // Thêm decorator để dễ sử dụng trong route
  fastify.decorate(
    'authenticate',
    async function (request, reply) {
      if (request.raw.url?.startsWith('/docs')) {
        return; // Bỏ qua xác thực cho /docs
      }
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  );
});



declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
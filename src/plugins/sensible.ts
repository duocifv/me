// src/plugins/common.ts
import fp from 'fastify-plugin';
import sensible from '@fastify/sensible';

export default fp(async function (fastify) {
  // 1. Đăng ký @fastify/sensible để có app.httpErrors & reply.*Error()
  await fastify.register(sensible);

  // 2. Cấu hình global error handler
  fastify.setErrorHandler((error, request, reply) => {
    // Log hoặc gửi sang hệ thống giám sát
    fastify.log.error(error);

    // Nếu error có statusCode (ví dụ throw app.httpErrors.notFound)
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      reply
        .code((error as any).statusCode)
        .send({ error: error.message });
    } else {
      // Mặc định 500
      reply
        .code(500)
        .send({ error: 'Internal Server Error' });
    }
  });
});

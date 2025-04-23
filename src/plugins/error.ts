import fp from 'fastify-plugin';
import sensible from '@fastify/sensible';
import { ZodError } from 'zod';

export default fp(async function (fastify) {
  // 1. Đăng ký @fastify/sensible để có app.httpErrors & reply.*Error()
  await fastify.register(sensible);

  // 2. Cấu hình global error handler
  fastify.setErrorHandler((error, request, reply) => {
    // Log lỗi
    fastify.log.error(error);

    // Kiểm tra lỗi Zod (xác thực không hợp lệ từ Zod)
    if (error instanceof ZodError) {
      return reply
        .code(422)
        .send({ error: 'Validation Error', issues: error.errors });
    }

    // Kiểm tra lỗi HTTP có statusCode
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      switch (error.statusCode) {
        case 400: // Bad Request
          reply
            .code(400)
            .send({ error: 'Bad Request', message: error.message });
          break;
        case 401: // Unauthorized
          reply
            .code(401)
            .send({ error: 'Unauthorized', message: error.message });
          break;
        case 403: // Forbidden
          reply
            .code(403)
            .send({ error: 'Forbidden', message: error.message });
          break;
        case 404: // Not Found
          reply
            .code(404)
            .send({ error: 'Not Found', message: error.message });
          break;
        case 500: // Internal Server Error
        default:
          reply
            .code(500)
            .send({ error: 'Internal Server Error', message: 'Có lỗi xảy ra trên máy chủ.' });
          break;
      }
    } else {
      // Lỗi không xác định, trả về 500
      reply
        .code(500)
        .send({ error: 'Internal Server Error', message: 'Có lỗi không xác định' });
    }
  });

});

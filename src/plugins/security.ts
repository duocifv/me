import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

export default fp(async (fastify: FastifyInstance) => {
  // Cấu hình bảo mật bằng Helmet
  await fastify.register(helmet, {
    global: true,
    contentSecurityPolicy: false, // hoặc tùy chỉnh CSP nếu cần
  });

  // Giới hạn tốc độ requests
  await fastify.register(rateLimit, {
    max: 100, // tối đa 100 requests
    timeWindow: '1 minute', // mỗi phút
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
    }),
  });
});

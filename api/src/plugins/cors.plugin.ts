// src/plugins/cors.plugin.ts

import fastifyCors, { FastifyCorsOptions } from '@fastify/cors';

/**
 * Cấu hình CORS với các phương thức HTTP được phép
 */
export const corsConfig: FastifyCorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true, // nếu cần gửi cookie
};
/**
 * Đăng ký Plugin CORS cho Fastify
 */
export default async function (app) {
  await app.register(fastifyCors, corsConfig);
}

// src/plugins/cors.plugin.ts

import fastifyCors, { FastifyCorsOptions } from '@fastify/cors';

/**
 * Cấu hình CORS với các phương thức HTTP được phép
 */
export const corsConfig: FastifyCorsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Authorization',
    'Content-Type',
    'x-device-fingerprint',
    'x-recaptcha-token',
    'X-User-Id',
  ],
  credentials: true,
};
/**
 * Đăng ký Plugin CORS cho Fastify
 */
export default async function (app) {
  await app.register(fastifyCors, corsConfig);
}

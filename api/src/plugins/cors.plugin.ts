// src/plugins/cors.plugin.ts
import fastifyCors, { FastifyCorsOptions } from '@fastify/cors';

export const corsConfig: FastifyCorsOptions = {
  origin: (origin, cb) => {
    console.log('🔍 Origin:', origin);
    const allowedOrigins = [
      'https://vegetable-container.onrender.com',
      'https://duoc2.vercel.app',
      'http://localhost:5000',
      'http://localhost:3000',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, origin || true); // ✅ fallback nếu undefined
    } else {
      cb(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Authorization',
    'Content-Type',
    'x-device-fingerprint',
    'x-recaptcha-token',
    'X-User-Id',
  ],
  credentials: true,
};

export default async function (app) {
  await app.register(fastifyCors, corsConfig);
}

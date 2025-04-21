import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      ignoreTrailingSlash: true,
    }),
  );

  // Cấu hình Swagger
  if (process.env.ENABLE_SWAGGER) {
    const config = new DocumentBuilder()
      .setTitle('My API')
      .setDescription('API documentation using Zod and Swagger')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    console.log('🧪 Swagger enabled at /api');
  }

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
  });
  const port = process.env.PORT ? +process.env.PORT : 5000;

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server ready at http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});

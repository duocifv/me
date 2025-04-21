import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import passwordManager from './plugins/app/password-manager';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      ignoreTrailingSlash: true,
    }),
  );
  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
  });
  await app.register(passwordManager);
  const port = process.env.PORT ? +process.env.PORT : 5000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server ready at http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});

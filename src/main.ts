import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      ignoreTrailingSlash: true,
    }),
  );

  const port = process.env.PORT ? +process.env.PORT : 5000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server ready at http://localhost:${port}`);
}

bootstrap();

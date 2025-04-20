import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      ignoreTrailingSlash: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

    // (Optional) If you need CORS, pipes, etc. you can enable them here:
  // app.enableCors();
  // app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT ? +process.env.PORT : 5000;
  // Listen on all interfaces (often needed in Docker / Cloud)
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server ready at http://localhost:${port}`);
}

bootstrap();

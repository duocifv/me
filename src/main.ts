import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { patchNestjsSwagger } from '@anatine/zod-nestjs';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { multipartPlugin } from './plugins/multipart.lugin';
import { authPlugin } from './plugins/auth.plugin';
import { fileManagerPlugin } from './plugins/file.plugin';
import mailerPlugin from './plugins/mailer.plugin';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.register(authPlugin);
  await app.register(multipartPlugin);
  await app.register(fileManagerPlugin);
  await app.register(mailerPlugin);

  if (process.env.ENABLE_SWAGGER) {
    const config = new DocumentBuilder()
      .setTitle('My API')
      .setDescription('API documentation using Zod and Swagger')
      .setVersion('1.0')
      .addServer('http://localhost:5000/', 'Upload server')
      .build();
    patchNestjsSwagger();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env.PORT ? +process.env.PORT : 5000;
  await app.listen(port);

  console.log(`🚀 Server ready at http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});

import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser(process.env.COOKIE_SECRET));

  if (process.env.ENABLE_SWAGGER) {
    const config = new DocumentBuilder()
      .setTitle('My API')
      .setDescription('API documentation using Zod and Swagger')
      .setVersion('1.0')
      .addServer('http://localhost:5000/', 'Upload server')
      .build();

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

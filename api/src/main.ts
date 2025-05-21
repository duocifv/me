import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { authPlugin } from './plugins/auth.plugin';
import { fileManagerPlugin } from './plugins/media/media.plugin';
import mailerPlugin from './plugins/mailer.plugin';
import { setupSwagger } from './plugins/swagger.plugin';
import { TypeOrmExceptionFilter } from './shared/filters/TypeOrmExceptionFilter';
import cors from './plugins/cors.plugin';
import recaptcha from './plugins/recaptcha.plugin';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
   app.enableVersioning({
    type: VersioningType.URI,  
    defaultVersion: '1',  
  });
  app.enableShutdownHooks();
  app.useGlobalFilters(new TypeOrmExceptionFilter());
  await cors(app);
  await recaptcha(app);
  await app.register(authPlugin);
  await app.register(fileManagerPlugin);
  await app.register(mailerPlugin);
  if (process.env.ENABLE_SWAGGER) {
    setupSwagger(app);
  }

  const port = process.env.PORT ? +process.env.PORT : 5000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server ready at http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});

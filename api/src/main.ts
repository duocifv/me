import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import authCookie from './plugins/auth.plugin';
import fileManager from './plugins/media/media.plugin';
import { setupSwagger } from './plugins/swagger.plugin';
import { TypeOrmExceptionFilter } from './shared/filters/TypeOrmExceptionFilter';
import cors from './plugins/cors.plugin';
import { VersioningType } from '@nestjs/common';
import securityHelmet from './plugins/security-helmet.plugin';
import mailer from './plugins/mailer.plugin';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
      disableRequestLogging: false,
    }),
  );
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.enableShutdownHooks();
  app.useGlobalFilters(new TypeOrmExceptionFilter());
  await securityHelmet(app);
  await cors(app);
  await authCookie(app);
  await fileManager(app);
  await mailer(app);
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

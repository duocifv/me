import Fastify from 'fastify';
import { AppModule } from './app.module';
import fwtPlugin from './plugins/jwt';
import authPlugin from './plugins/auth';
import guardPlugin from './plugins/guard';
import errorPlugin from './plugins/sensible'
import swaggerPlugin from './plugins/swagger';
import zodPlugin from './plugins/zod';
import dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = Fastify({ logger: false });
  try {
    app.register(swaggerPlugin);
    app.register(fwtPlugin);
    app.register(authPlugin);
    app.register(guardPlugin);
    app.register(errorPlugin);
    app.register(zodPlugin);

    await AppModule(app);

    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`🚀 Server is running at http://localhost:${port}`);
  
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();

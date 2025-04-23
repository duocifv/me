import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import { AppModule } from './app.module';
import fwtPlugin from './plugins/jwt';
import authPlugin from './plugins/auth';
import guardPlugin from './plugins/guard';
import errorPlugin from './plugins/error';
import swaggerPlugin from './plugins/swagger';
import zodPlugin from './plugins/zod/fastify-zod.';
import paginationPlugin from './plugins/pagination';
import { db } from './typeorm.config';

async function bootstrap() {
  const app = express();

  try {
    await db.initialize();

    app.use(express.json());

    app.use(swaggerPlugin);
    app.use(fwtPlugin);
    app.use(authPlugin);
    app.use(guardPlugin);
    app.use(errorPlugin);
    app.use(zodPlugin);
    app.use(paginationPlugin);

    await AppModule(app);

    const port = Number(process.env.PORT) || 3000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

bootstrap();

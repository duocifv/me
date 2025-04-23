import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import { AppModule } from './app.module';
import fwtMiddleware from './middlewares/jwt.middleware';
import authMiddleware from './middlewares/auth.middleware';
import guardMiddleware from './middlewares/guard.middleware';
import errorMiddleware from './middlewares/error.middleware';
import swaggerMiddleware from './middlewares/swagger';
import zodMiddleware from './middlewares/zod/express-zod';
import paginationMiddleware from './middlewares/pagination.middleware';
import { db } from './typeorm.config';

async function bootstrap() {
  const app = express();

  try {
    await db.initialize();

    app.use(express.json());

    app.use(swaggerMiddleware);
    app.use(fwtMiddleware);
    app.use(authMiddleware);
    app.use(guardMiddleware);
    app.use(errorMiddleware);
    app.use(zodMiddleware);
    app.use(paginationMiddleware);

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

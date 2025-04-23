import express from 'express';
import dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
  const app = express();

  app.use(express.json());

  await AppModule(app);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
  });
}

bootstrap();

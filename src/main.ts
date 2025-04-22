import Fastify from 'fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = Number(process.env.PORT) || 3000;
  const app = Fastify({ logger: true });

  await AppModule(app);

  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server is running at http://localhost:${port}`);
    // app.log.info(`🚀 Server is running at ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();

import Fastify from 'fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = Fastify({ logger: false });
  await AppModule(app);

  await app.listen({ port: Number(process.env.PORT) || 3000 });
  app.log.info(`Server running on port ${process.env.PORT || 3000}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
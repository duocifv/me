import { FastifyInstance } from 'fastify';
import { UserModule } from './user/user.module';

export async function AppModule(app: FastifyInstance) {
  await UserModule(app);
}

import { FastifyInstance } from 'fastify';
import { userRoutes } from './user.controller';


export async function UserModule(app: FastifyInstance) {
  app.register(userRoutes, { prefix: '/users' });
}
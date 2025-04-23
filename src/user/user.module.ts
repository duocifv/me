import { FastifyInstance } from 'fastify';
import { userRoutes } from './user.controller';

export async function UserModule(route: FastifyInstance) {
  route.register(userRoutes, { prefix: '/users' });
}
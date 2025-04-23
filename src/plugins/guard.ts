import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import guard from "fastify-guard";

export default fp(async (fastify: FastifyInstance) => {

    fastify.register(guard, {
    errorHandler: (request, reply, error) => {
      return reply.send('you are not allowed to call this route')
    },
  });
});

import fp from 'fastify-plugin';
import { FastifyInstance, RouteOptions } from 'fastify';

export default fp(async (fastify: FastifyInstance) => {
    fastify.addHook('onRoute', (routeOptions: RouteOptions) => {
        const isPublic = routeOptions.config?.public;

        if (!isPublic) {
            const prev = routeOptions.preHandler ?? [];
            const handlers = Array.isArray(prev) ? prev : [prev];

            // Override preHandler to include authentication
            routeOptions.preHandler = [
                fastify.authenticate,
                ...handlers,
            ];
        }
    });
});

declare module 'fastify' {
    interface FastifyContextConfig {
        public?: boolean;
    }
}
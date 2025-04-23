// src/plugins/pagination.ts
import fp from 'fastify-plugin';

declare module 'fastify' {
    interface FastifyRequest {
        pagination: {
            page: number;
            limit: number;
            offset: number;
        };
    }
}

export default fp(async function (fastify) {
    fastify.addHook('preHandler', async (req) => {
        const page = parseInt((req.query as any).page) || 1;
        const limit = Math.min(parseInt((req.query as any).limit) || 10, 100);
        const offset = (page - 1) * limit;

        req.pagination = { page, limit, offset };
    });
});

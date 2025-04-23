import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export const PaginationDto = z.object({
  limit: z
    .string()
    .optional()
    .describe('Số lượng bản ghi mỗi trang')
    .default('10'),
  offset: z.string().optional().describe('Vị trí bắt đầu').default('0'),
});

export const PaginationData = z.object({
  items: z.array(z.object({})),
  totalPages: z.number(),
  currentPage: z.number(),
  pageSize: z.number(),
});

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorateRequest('paginationDto', function () {
    const query = this.query as Record<string, string>;
    const parsedQuery = PaginationDto.parse(query);
    const take = parseInt(parsedQuery.limit, 10);
    const skip = parseInt(parsedQuery.offset, 10);
    return { take, skip };
  });

  fastify.decorateReply(
    'paginationData',
    function (items: any[], totalCount: number, take: number, skip: number) {
      return {
        items,
        totalPages: Math.ceil(totalCount / take),
        currentPage: Math.floor(skip / take) + 1,
        pageSize: take,
      };
    }
  );
});

declare module 'fastify' {
  interface FastifyRequest {
    paginationDto(): { take: number; skip: number };
  }
  interface FastifyReply {
    paginationData(
      items: any[],
      totalCount: number,
      take: number,
      skip: number
    ): {
      items: any[];
      totalPages: number;
      currentPage: number;
      pageSize: number;
    };
  }
}

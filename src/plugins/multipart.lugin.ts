import fp from 'fastify-plugin';
import multipart from '@fastify/multipart';

export const multipartPlugin = fp((fastify) => {
  fastify.register(multipart, {
    limits: {
      fieldNameSize: 100,
      fieldSize: 100,
      fields: 10,
      fileSize: 1_000_000,
      files: 1,
      headerPairs: 2000,
      parts: 1000,
    },
  });
});

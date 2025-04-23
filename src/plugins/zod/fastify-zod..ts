import fp from 'fastify-plugin';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';


/**
 * Plugin Zod dùng để cấu hình Fastify hiểu schema Zod
 */
export default fp(async function zodPlugin(fastify) {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);
});


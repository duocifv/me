import 'fastify';
import { User } from 'src/user/entities/user.entity';

declare module 'fastify' {
    interface FastifyRequest {
        user?: User;
    }
}

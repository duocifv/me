import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: SignInDto, res: any): Promise<{
        accessToken: string;
    }>;
    refresh(req: FastifyRequest, res: FastifyReply): Promise<{
        accessToken: string;
    }>;
    logout(req: any, res: any): Promise<{
        message: string;
    }>;
}

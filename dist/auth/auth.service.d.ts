import { TokensService } from './tokens.service';
import { UsersService } from 'src/user/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
export declare class AuthService {
    private readonly usersService;
    private readonly tokensService;
    constructor(usersService: UsersService, tokensService: TokensService);
    signIn(dto: SignInDto, res: FastifyReply): Promise<{
        accessToken: string;
    }>;
    refreshTokens(req: FastifyRequest, res: FastifyReply): Promise<{
        accessToken: string;
    }>;
    logout(req: FastifyRequest, res: FastifyReply): Promise<{
        message: string;
    }>;
}

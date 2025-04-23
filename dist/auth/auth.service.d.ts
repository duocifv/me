import { Response, Request } from 'express';
import { TokensService } from './tokens.service';
import { SignInDto } from './dto/sign-in.dto';
import { UsersService } from 'src/user/users.service';
export declare class AuthService {
    private readonly usersService;
    private readonly tokensService;
    constructor(usersService: UsersService, tokensService: TokensService);
    signIn(dto: SignInDto, res: Response): Promise<{
        accessToken: string;
    }>;
    refreshTokens(req: Request, res: Response): Promise<{
        accessToken: string;
    }>;
    logout(req: Request, res: Response): Promise<{
        message: string;
    }>;
}

import { AuthService } from './auth.service';
import { UsersService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(dto: CreateUserDto): Promise<import("../user/user.entity").User>;
    login(req: any): Promise<{
        access_token: string;
    }>;
}

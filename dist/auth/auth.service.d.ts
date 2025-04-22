import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UsersService } from 'src/user/user.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(body: CreateUserDto): Promise<{
        id: string;
        email: string;
        roles: "user" | "admin";
    }>;
    login(user: any): Promise<{
        access_token: string;
    }>;
}

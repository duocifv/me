import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private readonly repo;
    constructor(repo: Repository<User>);
    create({ email, password }: CreateUserDto): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User>;
    findAll(): Promise<Pick<User, 'id' | 'email' | 'roles'>[]>;
}

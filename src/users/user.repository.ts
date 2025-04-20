import { User } from "./user.entity";

type Insert = { name: string; email: string }

export interface UsersRepository {
    findAll(): Promise<User[]>;
    create(body: Insert): Promise<User>;
}
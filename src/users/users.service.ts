import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/mysql';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: EntityManager,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find(User, {});
  }

  async create(data: { name: string; email: string }): Promise<User> {
    const user = this.userRepository.create(User, data);
    await this.userRepository.persistAndFlush(user);
    return user;
  }
}

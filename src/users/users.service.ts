import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/mysql';
import { User } from './user.entity';
import { UsersRepository } from './user.repository';

@Injectable()
export class UsersService implements UsersRepository {
  constructor(
    @InjectRepository(User) private readonly userRepository: EntityManager,
  ) {}

  async findAll() {
    return this.userRepository.find(User, {});
  }

  async create(body) {
    const user = this.userRepository.create(User, body);
    await this.userRepository.persistAndFlush(user);
    return user;
  }
}

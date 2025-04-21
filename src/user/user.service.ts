import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from './user.entity';
import bcrypt from 'bcryptjs';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly User: EntityRepository<User>,
    private readonly db: EntityManager,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.User.findOne({ username });
  }

  async createUser({ username, password }: CreateUserDto): Promise<User> {
    const hash = await bcrypt.hash(password, 10);
    const user = this.User.create({
      username,
      password: hash,
    });
    await this.db.persistAndFlush(user);

    return user;
  }
}

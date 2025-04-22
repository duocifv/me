// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create({ email, password }: CreateUserDto): Promise<User> {
    const hash = await bcrypt.hash(password, 10);
    const user = this.repo.create({ email, password: hash });
    return this.repo.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string): Promise<User> {
    return this.repo.findOneOrFail({ where: { id } });
  }

  findAll(): Promise<Pick<User, 'id' | 'email' | 'roles'>[]> {
    return this.repo.find({
      select: ['id', 'email', 'roles'],
    });
  }
}

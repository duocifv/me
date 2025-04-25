import { Injectable, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  findAll() {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  /**
   * Tạo mới user, hash password trước khi lưu.
   */
  async create(dto: CreateUserDto) {
    const exists = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException('Email đã tồn tại');
    }
    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({ email: dto.email, password: hash });
    return this.usersRepo.save(user);
  }

  /**
   * Tìm user theo email.
   */
  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  /**
   * Tìm user theo id.
   */
  async findById(id: number) {
    return this.usersRepo.findOne({ where: { id } });
  }

  /**
   * Validate đăng nhập: so sánh password.
   */
  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const matches = await bcrypt.compare(password, user.password);
    return matches ? user : null;
  }
}

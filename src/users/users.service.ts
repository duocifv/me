import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity'; // Import entity User

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>, // Inject repository User
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find(); // Lấy tất cả người dùng
  }

  create(data: { name: string; email: string }): Promise<User> {
    const user = this.userRepository.create(data); // Tạo người dùng mới từ dữ liệu
    return this.userRepository.save(user); // Lưu người dùng vào cơ sở dữ liệu
  }
}

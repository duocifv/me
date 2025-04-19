// src/users/users.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity'; // Import entity User
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Đăng ký entity User
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}

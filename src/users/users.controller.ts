import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll(); 
  }

  @Post()
  async create(@Body() data: { name: string; email: string }): Promise<User> {
    return this.usersService.create(data);
  }
}

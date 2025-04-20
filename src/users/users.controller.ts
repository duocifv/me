import { Controller, Get, Post, Body, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateCatDto, createCatSchema } from './users.schema';
import { ZodValidationPipe } from 'src/share/pipes/zod-validation.pipe';

@Controller('users')

export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createCatSchema))
  async create(@Body() data: CreateCatDto): Promise<User> {
    return this.usersService.create(data);
  }
}

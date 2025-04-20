import { Controller, Get, Post, Body, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateCatDto, createCatSchema } from './users.dto';
import { ZodValidationPipe } from 'src/share/pipes/zod-validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createCatSchema))
  async create(@Body() body: CreateCatDto) {
    return this.usersService.create(body);
  }
  
}

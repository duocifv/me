import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/shared/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  // @Permissions('create:posts')
  // @Scopes('write:posts')

  // @Roles('admin', 'user')
  findAll() {
    return `GET user all`;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `GET user ${id}`;
  }

  @Post()
  @HttpCode(201)
  create(@Body() body: any) {
    return { message: 'User created', data: body };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return { message: `User ${id} updated`, data: body };
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return { message: `User ${id} deleted` };
  }
}

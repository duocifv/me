import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CreateUserDto, CreateUserSchema } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { Schema } from 'src/common/decorators/dto.decorator';
import { UseRoles } from 'nest-access-control';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me() {
    return 'GET /api/users/me';
  }

  @Post('register')
  @HttpCode(201)
  @UseRoles({ resource: 'article', action: 'read', possession: 'any' })
  @Schema(CreateUserSchema)
  async register(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return { id: user.id, email: user.email };
  }

  @Roles('admin')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `GET user ${id}`;
  }

  @Post()
  create(@Body() body: any) {
    return { message: 'User created', data: body };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return { message: `User ${id} updated`, data: body };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return { message: `User ${id} deleted` };
  }
}

import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { CreateUserDto, CreateUserSchema } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { Schema } from 'src/common/decorators/dto.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Đăng ký tài khoản mới.
   */
  @Post('register')
  @HttpCode(201)
  @Schema(CreateUserSchema)
  async register(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return { id: user.id, email: user.email };
  }
}

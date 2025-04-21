// src/auth/auth.controller.ts
import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { UsersService } from 'src/user/user.service';
import { CreateUserDto, CreateUserZod } from 'src/user/dto/create-user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Z } from 'src/common/pipes/zod-validation.pipe';


@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) { }

  @Public()
  @Post('register')
  async register(@Body(new Z(CreateUserZod)) dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
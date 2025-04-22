// src/users/users.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../auth/decorator/roles.decorator';
import { UsersService } from './user.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Open to any authenticated user
  @Get('me')
  getProfile(@Req() req) {
    return req.user;
  }

  // Only admins can list all users
  @Roles(Role.Admin)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}

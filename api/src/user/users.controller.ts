import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Param,
  Put,
  Delete,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesAllowed } from 'src/roles/roles.decorator';
import { Roles } from 'src/roles/dto/role.enum';
import { ApiTags } from '@nestjs/swagger';
import { GetUsersDto, GetUsersSchema } from './dto/get-users.dto';
import { Schema } from 'src/shared/decorators/dto.decorator';
import {
  ChangePasswordDto,
  ChangePasswordSchema,
} from './dto/change-password.dto';
import {
  UpdateProfileDto,
  UpdateProfileSchema,
} from './dto/update-profile.dto';
import {
  UpdateByAdminDto,
  UpdateByAdminSchema,
} from './dto/update-by-admin.dto';
import { CreateUserDto, CreateUserSchema } from './dto/create-user.dto';

@ApiTags('Users - Khu vực ADMIN mới được truy cập')
@RolesAllowed(Roles.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // @Permissions('create:posts')
  // @Scopes('write:posts')
  @Schema(GetUsersSchema, 'query')
  async findAll(@Query() dto: GetUsersDto) {
    const paginate = await this.usersService.getUsers(dto);
    const stats = await this.usersService.getUsersWithStats();
    return {
      ...paginate,
      stats,
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return await this.usersService.findById(id);
  }

  @Put(':id')
  @Schema(UpdateByAdminSchema)
  async update(@Param('id') id: string, @Body() dto: UpdateByAdminDto) {
    return await this.usersService.update(id, dto);
  }

  @Put(':id/profile')
  @Schema(UpdateProfileSchema)
  async updateProfile(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(id, dto);
  }

  @Put(':id/restore')
  @HttpCode(200)
  async restore(@Param('id') id: string) {
    return await this.usersService.restore(id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove() {
    throw new UnauthorizedException('Admin không được phép xóa người dùng');
  }

  @Post()
  @Schema(CreateUserSchema)
  @HttpCode(201)
  register(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}

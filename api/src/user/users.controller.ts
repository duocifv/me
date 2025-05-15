import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Param,
  Put,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesAllowed } from 'src/roles/roles.decorator';
import { Roles } from 'src/roles/dto/role.enum';
import { ApiTags } from '@nestjs/swagger';
import { GetUsersDto, GetUsersSchema } from './dto/get-users.dto';
import { Schema } from 'src/shared/decorators/dto.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  UpdateByAdminDto,
  UpdateByAdminSchema,
} from './dto/update-by-admin.dto';
import { CreateUserDto, CreateUserSchema } from './dto/create-user.dto';
import { ZodBody } from 'src/shared/decorators/zod-body.decorator';
import { ZodQuery } from 'src/shared/decorators/zod-query.decorator';

@ApiTags('Users - Khu vực ADMIN mới được truy cập')
@RolesAllowed(Roles.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // @Permissions('create:posts')
  // @Scopes('write:posts')
  async findAll(@ZodQuery(GetUsersSchema) dto: GetUsersDto) {
    console.log('findAll 1', dto);
    const paginate = await this.usersService.getUsers(dto);
    const stats = await this.usersService.getUsersWithStats();
    return {
      ...paginate,
      stats,
    };
  }

  @Get(':id')
  async getUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @ZodBody(UpdateByAdminSchema) dto: UpdateByAdminDto,
  ) {
    console.log('dtodtodtodto 1', dto);
    return await this.usersService.update(id, dto);
  }

  @Put(':id/profile')
  async updateProfile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(id, dto);
  }

  @Put(':id/restore')
  @HttpCode(200)
  async restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.restore(id);
  }

  // @Delete(':id')
  // @HttpCode(204)
  // remove() {
  //   throw new UnauthorizedException('Admin không được phép xóa người dùng');
  // }

  @Post()
  @HttpCode(201)
  register(@ZodBody(CreateUserSchema) dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}

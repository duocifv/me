import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Param,
  Put,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from '../v1/users.service';
import { RolesAllowed } from 'src/roles/roles.decorator';
import { Roles } from 'src/roles/dto/role.enum';
import { ApiTags } from '@nestjs/swagger';
import { GetUsersDto, GetUsersSchema } from '../dto/get-users.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import {
  UpdateByAdminDto,
  UpdateByAdminSchema,
} from '../dto/update-by-admin.dto';
import { CreateUserDto, CreateUserSchema } from '../dto/create-user.dto';
import { QuerySchema } from 'src/shared/decorators/query-schema.decorator';
import { BodySchema } from 'src/shared/decorators/body-schema.decorator';
import { UserDto } from '../dto/user.dto';
import { MailService } from 'src/mail/v1/mail.service';

@ApiTags('Users - Khu vực ADMIN mới được truy cập')
@RolesAllowed(Roles.ADMIN)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  // @Permissions('create:posts')
  // @Scopes('write:posts')
  async findAll(@QuerySchema(GetUsersSchema) dto: GetUsersDto) {
    const paginate = await this.usersService.paginateUsers(dto);
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
    @BodySchema(UpdateByAdminSchema) dto: UpdateByAdminDto,
  ) {
    return await this.usersService.update(id, dto);
  }

  @Put(':id/profile')
  async updateProfile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(id, dto);
  }

  // @Put(':id/restore')
  // @HttpCode(200)
  // async restore(@Param('id', new ParseUUIDPipe()) id: string) {
  //   return await this.usersService.restore(id);
  // }

  // @Delete(':id')
  // @HttpCode(204)
  // remove() {
  //   throw new UnauthorizedException('Admin không được phép xóa người dùng');
  // }

  @Post()
  @HttpCode(201)
  async register(
    @BodySchema(CreateUserSchema) dto: CreateUserDto,
  ): Promise<UserDto> {
    const { fullUser, dto: userDto } = await this.usersService.create(dto);

    const token =
      await this.usersService.generateEmailVerificationToken(fullUser);
    await this.mailService.sendEmailVerification(fullUser.email, token);

    return userDto;
  }
}

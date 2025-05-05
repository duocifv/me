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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesAllowed } from 'src/shared/decorators/roles.decorator';
import { Roles } from 'src/roles/role.enum';
import { ApiTags } from '@nestjs/swagger';
import { GetUsersDto, GetUsersSchema } from './dto/get-users.dto';
import { PaginationQueryParams } from 'src/shared/decorators/query-params.decorator';

@ApiTags('Users - Khu vực ADMIN mới được truy cập')
@RolesAllowed(Roles.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // @Permissions('create:posts')
  // @Scopes('write:posts')
  @PaginationQueryParams()
  async findAll(@Query() GetUsersDto: GetUsersDto) {
    console.log('dto parse 1---->', GetUsersDto);
    const parse = GetUsersSchema.parse(GetUsersDto);
    const paginate = await this.usersService.getUsers(parse);
    const stats = await this.usersService.getUsersWithStats();
    return {
      ...paginate,
      stats,
    };
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

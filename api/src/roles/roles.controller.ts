import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './roles.service';
import { Permissions } from 'src/permissions/permissions.decorator';
import { PermissionName } from 'src/permissions/permission.enum';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /** Tạo mới role */
  @Post()
  @Permissions(PermissionName.MANAGE_ROLES)
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  /** Lấy toàn bộ roles */
  @Get()
  @Permissions(PermissionName.VIEW_ROLES)
  findAll() {
    return this.roleService.findAll();
  }

  /** Lấy chi tiết role theo ID */
  @Get(':id')
  @Permissions(PermissionName.VIEW_ROLES)
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  /** Cập nhật role */
  @Put(':id')
  @Permissions(PermissionName.MANAGE_ROLES)
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto);
  }

  /** Xóa role */
  @Delete(':id')
  @Permissions(PermissionName.MANAGE_ROLES)
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}

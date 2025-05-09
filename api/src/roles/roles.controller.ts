import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UpdateRoleDto, UpdateRoleSchema } from './dto/update-role.dto';
import { RoleService } from './roles.service';
import { Permissions } from 'src/permissions/permissions.decorator';
import { PermissionName } from 'src/permissions/permission.enum';
import { Schema } from 'src/shared/decorators/dto.decorator';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /** Lấy toàn bộ roles */
  @Get()
  @Permissions(PermissionName.VIEW_ROLES)
  findAll() {
    return this.roleService.findAll();
  }

  /** Lấy chi tiết role theo ID */
  @Get(':id')
  @Permissions(PermissionName.VIEW_ROLES)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.roleService.findById(id);
  }

  /** Cập nhật role */
  @Put(':id')
  @Permissions(PermissionName.MANAGE_ROLES)
  @Schema(UpdateRoleSchema)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.roleService.update(id, dto);
  }

  /** Tạo mới role */
  // @Post()
  // @Permissions(PermissionName.MANAGE_ROLES)
  // create(@Body() dto: CreateRoleDto) {
  //   return this.roleService.create(dto);
  // }

  /** Xóa role */
  // @Delete(':id')
  // @Permissions(PermissionName.MANAGE_ROLES)
  // remove(@Param('id') id: string) {
  //   return this.roleService.remove(id);
  // }
}

import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/permissions/permissions.decorator';
import { PermissionName } from './permission.enum';
import { PermissionsService } from './permissions.service';
// import { Schema } from 'src/shared/decorators/dto.decorator';
// import {
//   CreatePermissionDto,
//   CreatePermissionSchema,
//   UpdatePermissionDto,
//   UpdatePermissionSchema,
// } from './dto/permission.dto';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /** Lấy danh sách permissions */
  @Get()
  @Permissions(PermissionName.VIEW_PERMISSIONS)
  findAll() {
    return this.permissionsService.findAll();
  }

  /** Lấy chi tiết permission */
  @Get(':id')
  @Permissions(PermissionName.VIEW_PERMISSIONS)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.permissionsService.findOne(id);
  }

  // /** Tạo mới permission */
  // @Post()
  // @Schema(CreatePermissionSchema)
  // @Permissions(PermissionName.MANAGE_PERMISSIONS)
  // create(@Body() dto: CreatePermissionDto) {
  //   return this.permissionsService.create(dto);
  // }

  // /** Cập nhật permission*/
  // @Put(':id')
  // @Schema(UpdatePermissionSchema)
  // @Permissions(PermissionName.MANAGE_PERMISSIONS)
  // async update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
  //   const updated = await this.permissionsService.update(id, dto);
  //   if (!updated) {
  //     throw new NotFoundException(`Permission with id ${id} not found`);
  //   }
  //   return updated;
  // }

  // /** Xóa permission */
  // @Delete(':id')
  // @Permissions(PermissionName.MANAGE_PERMISSIONS)
  // remove(@Param('id') id: string) {
  //   return this.permissionsService.delete(id);
  // }
}

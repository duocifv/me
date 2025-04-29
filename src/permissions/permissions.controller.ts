// src/permissions/permissions.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/roles/role.enum';
import { RolesAllowed } from 'src/shared/decorators/roles.decorator';


@ApiTags('Permissions - Khu vực ADMIN mới được truy cập')
@RolesAllowed(Roles.ADMIN)
@Controller('permissions')
export class PermissionsController {
  @Get()
  findAll() {
    return 'GET /api/permissions';
  }

  @Post()
  create(@Body() body: any) {
    return 'POST /api/permissions';
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return `PUT /api/permissions/${id}`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `DELETE /api/permissions/${id}`;
  }
}

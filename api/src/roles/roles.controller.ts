// src/roles/roles.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CreateRoleDto, CreateRoleSchema } from './dto/create-role.dto';
import { Schema } from 'src/shared/decorators/dto.decorator';
import { UpdateRoleDto, UpdateRoleSchema } from './dto/update-role.dto';
import { IdParamDto, IdParamSchema } from './dto/Id-role.dto';
import { ApiTags } from '@nestjs/swagger';
import { RolesAllowed } from 'src/shared/decorators/roles.decorator';
import { Roles } from './dto/role.enum';

@ApiTags('Roles - Khu vực ADMIN mới được truy cập')
@RolesAllowed(Roles.ADMIN)
@Controller('roles')
export class RolesController {
  @Get()
  findAll() {
    return 'GET /api/roles';
  }

  @Get(':id')
  @Schema(IdParamSchema)
  findOne(@Param('id') id: IdParamDto) {
    return `GET /api/roles/${id}`;
  }

  @Post()
  @Schema(CreateRoleSchema)
  create(@Body() body: CreateRoleDto) {
    return 'POST /api/roles';
  }

  @Put(':id')
  @Schema(UpdateRoleSchema)
  update(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return `PUT /api/roles/${id}`;
  }

  @Delete(':id')
  @Schema(IdParamSchema)
  remove(@Param('id') id: IdParamDto) {
    return `DELETE /api/roles/${id}`;
  }
}

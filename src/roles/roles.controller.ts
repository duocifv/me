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

@Controller('roles')
export class RolesController {
  @Get()
  findAll() {
    return 'GET /api/roles';
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `GET /api/roles/${id}`;
  }

  @Post()
  create(@Body() body: any) {
    return 'POST /api/roles';
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return `PUT /api/roles/${id}`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `DELETE /api/roles/${id}`;
  }
}

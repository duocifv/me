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

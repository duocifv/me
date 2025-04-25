import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

@Controller('categories')
export class CategoryController {
  @Get()
  findAll() {
    return 'GET all categories';
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `GET category ${id}`;
  }

  @Post()
  create(@Body() body: any) {
    return { message: 'Category created', data: body };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return { message: `Category ${id} updated`, data: body };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return { message: `Category ${id} deleted` };
  }
}

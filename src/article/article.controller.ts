import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

@Controller('articles')
export class ArticleController {
  @Get()
  findAll() {
    return 'GET all articles';
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `GET article ${id}`;
  }

  @Post()
  create(@Body() body: any) {
    return { message: 'Article created', data: body };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return { message: `Article ${id} updated`, data: body };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return { message: `Article ${id} deleted` };
  }
}

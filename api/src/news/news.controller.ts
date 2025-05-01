// src/news/news.controller.ts
import {
  Controller,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { PaginateNewsDto } from './paginate-news.dto';
import { News } from './entities/news.entity';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async index(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query() filters: PaginateNewsDto,
  ): Promise<Pagination<News>> {
    limit = Math.min(limit, 50);
    return this.newsService.paginate(
      { page, limit, route: '/news' },
      { search: filters.search, published: filters.published },
    );
  }
}

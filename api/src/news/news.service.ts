// src/news/news.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { Repository } from 'typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly repo: Repository<News>,
  ) {}

  async paginate(
    options: IPaginationOptions,
    filters: { search?: string; published?: boolean },
  ): Promise<Pagination<News>> {
    const qb = this.repo.createQueryBuilder('news');

    // filter theo keyword
    if (filters.search) {
      qb.andWhere('news.title LIKE :s OR news.body LIKE :s', {
        s: `%${filters.search}%`,
      });
    }

    // filter theo published
    if (filters.published !== undefined) {
      qb.andWhere('news.published = :p', { p: filters.published });
    }

    // đảm bảo có route để build links
    options.route = options.route || '/news';
    return paginate<News>(qb, options);
  }
}

// src/common/pagination/pagination.service.ts
import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { paginate, IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class PaginationService {
  async paginate<T>(
    qb: SelectQueryBuilder<T>,
    options: IPaginationOptions,
    route: string,
  ): Promise<Pagination<T>> {
    options.route = options.route || route;
    return paginate<T>(qb, options);
  }
}
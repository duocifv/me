// src/common/pagination/pagination.service.ts
import { Injectable } from '@nestjs/common';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class PaginationService {
  async paginate<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    options: IPaginationOptions,
    route: string,
    filters?: Record<string, any>,
    searchableFields: string[] = [],
  ): Promise<Pagination<T>> {
    options.route = options.route || route;
    if (filters?.search && searchableFields.length > 0) {
      qb.andWhere(
        searchableFields
          .map((field, idx) => `LOWER(${qb.alias}.${field}) LIKE :search${idx}`)
          .join(' OR '),
        Object.fromEntries(
          searchableFields.map((_, idx) => [
            `search${idx}`,
            `%${filters.search.toLowerCase()}%`,
          ]),
        ),
      );
    }

    // Add more filters if needed
    for (const [key, value] of Object.entries(filters || {})) {
      if (key !== 'search' && value !== undefined) {
        qb.andWhere(`${qb.alias}.${key} = :${key}`, { [key]: value });
      }
    }
    console.log(qb.getQueryAndParameters());
    return paginate<T>(qb, options);
  }
}

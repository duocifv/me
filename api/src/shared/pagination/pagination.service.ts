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
      const safeSearch = this.escapeLike(filters.search.toLowerCase());

      qb.andWhere(
        searchableFields
          .map(
            (field) =>
              `LOWER(${qb.alias}.${field}) LIKE '%${safeSearch}%' ESCAPE '\\'`,
          )
          .join(' OR '),
      );
    }
    for (const [key, value] of Object.entries(filters || {})) {
      if (key !== 'search' && value !== undefined) {
        qb.andWhere(`${qb.alias}.${key} = :${key}`, { [key]: value });
      }
    }

    console.log(qb.getQueryAndParameters());
    return paginate<T>(qb, options);
  }

  private escapeLike(str: string): string {
    return str
      .replace(/\\/g, '\\\\') // Escape backslash
      .replace(/%/g, '\\%') // Escape %
      .replace(/_/g, '\\_') // Escape _
      .replace(/'/g, "''"); // Escape single quote
  }
}

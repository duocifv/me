// src/common/decorators/query-params.decorator.ts
import { ApiQuery } from '@nestjs/swagger';

export function PaginationQueryParams() {
  return function (
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    // Thêm các ApiQuery vào method của bạn
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number for pagination',
      example: 1,
    })(target, key, descriptor);

    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page',
      example: 10,
    })(target, key, descriptor);

    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Search keyword for filtering users by email',
      example: '',
    })(target, key, descriptor);

    ApiQuery({
      name: 'status',
      required: false,
      type: String,
      description: 'Filter by user status (active, pending, etc.)',
      example: 'pending',
    })(target, key, descriptor);

    ApiQuery({
      name: 'isActive',
      required: false,
      type: Boolean,
      description: 'Filter by user active status',
      example: true,
    })(target, key, descriptor);

    ApiQuery({
      name: 'isPaid',
      required: false,
      type: Boolean,
      description: 'Filter by user paid status',
      example: false,
    })(target, key, descriptor);
  };
}

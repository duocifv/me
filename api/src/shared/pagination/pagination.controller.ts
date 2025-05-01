// src/common/pagination/pagination.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { PaginationService } from './pagination.service';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

@Controller('pagination')
export class PaginationController {
  constructor(private readonly paginationService: PaginationService) {}

  @Get()
  getExample(@Query() options: IPaginationOptions): Promise<Pagination<any>> {
    // Example usage; replace with real repository
    throw new Error('Not implemented: Use PaginationService in your modules.');
  }
}

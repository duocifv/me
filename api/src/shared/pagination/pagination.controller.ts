// src/common/pagination/pagination.controller.ts
import { Controller, Get } from '@nestjs/common';
// import { PaginationService } from './pagination.service';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('pagination')
export class PaginationController {
  // constructor(private readonly paginationService: PaginationService) {}
  //@Query() options: IPaginationOptions
  @Get()
  getExample(): Promise<Pagination<any>> {
    // Example usage; replace with real repository
    throw new Error('Not implemented: Use PaginationService in your modules.');
  }
}

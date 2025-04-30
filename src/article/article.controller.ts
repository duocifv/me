// src/articles/articles.controller.ts
import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { Article } from './article.entity';
import { ArticlesService } from './articles.service';

@Crud({
  model: { type: Article },
  params: {
    id: { field: 'id', type: 'number', primary: true },
  },
  query: {
    alwaysPaginate: true, // luôn trả về pagination
    limit: 10, // default page size
    maxLimit: 50, // max page size
    sort: [{ field: 'createdAt', order: 'DESC' }],
    // bạn có thể thêm join, filter operators ở đây nếu cần
  },
})
@Controller('articles')
export class ArticlesController implements CrudController<Article> {
  constructor(public service: ArticlesService) {}
}

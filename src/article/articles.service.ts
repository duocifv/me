// src/articles/articles.service.ts
import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './article.entity';

@Injectable()
export class ArticlesService extends TypeOrmCrudService<Article> {
    constructor(@InjectRepository(Article) repo) {
        super(repo);
    }
}

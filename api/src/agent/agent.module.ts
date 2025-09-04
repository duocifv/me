import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiteBlog } from 'src/sqlite/lite-blog.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LiteBlog],
      'sqlite',
    ),
  ],
  providers: [AgentService],
  controllers: [AgentController],
  exports: [AgentService],
})
export class AgentModule { }

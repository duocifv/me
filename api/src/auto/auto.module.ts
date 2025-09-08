import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiteEmbedding } from 'src/sqlite/lite-embedding.entity';
import { AgentService } from './services/agent.service';
import { RAGService } from './services/rag.service';
import { ReasoningService } from './services/reasoning.service';
import { OrchestratorService } from './services/orchestrator.service';
import { AutoController } from './auto.controller';
import { LLMService } from './services/llm.service';

@Module({
  imports: [TypeOrmModule.forFeature([LiteEmbedding], 'sqlite')],
  controllers: [AutoController],
  providers: [
    LLMService,
    RAGService,
    ReasoningService,
    AgentService,
    OrchestratorService,
  ],
})
export class AutoModule {}

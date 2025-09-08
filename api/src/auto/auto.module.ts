import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiteEmbedding } from 'src/sqlite/lite-embedding.entity';
import { AgentService } from './services/agent.service';
import { RAGService } from './services/rag.service';
import { MCPService } from './services/mcp.service';
import { ReasoningService } from './services/reasoning.service';
import { OrchestratorService } from './services/orchestrator.service';
import { AutoController } from './auto.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LiteEmbedding], 'sqlite')],
  controllers: [AutoController],
  providers: [
    AgentService,
    RAGService,
    MCPService,
    ReasoningService,
    OrchestratorService,
  ],
})
export class AutoModule {}

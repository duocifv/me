// ai/agent.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { RAGService } from './rag.service';
import {
  checkStockTool,
  getPriceTool,
  ragSearchTool,
  searchTool,
} from './mcp.service';
import { LLMService } from './llm.service';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';

@Injectable()
export class AgentService implements OnModuleInit {
  private agentExecutor: AgentExecutor;

  constructor(
    private readonly llm: LLMService,
    private readonly rag: RAGService,
  ) {}

  async onModuleInit() {
    const tools = [
      checkStockTool,
      getPriceTool,
      searchTool,
      ragSearchTool(this.rag),
    ];

    // Prompt bắt buộc phải có agent_scratchpad
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'Bạn là một trợ lý thông minh, hãy chọn tool phù hợp để trả lời người dùng.',
      ],
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad'),
    ]);

    const agent = await createOpenAIFunctionsAgent({
      llm: this.llm.gemini, // LLMService trả về model
      tools,
      prompt,
    });

    this.agentExecutor = new AgentExecutor({
      agent,
      tools,
    });
  }

  async run(query: string): Promise<{ output: string | string[] }> {
    const result = await this.agentExecutor.invoke({ input: query });
    console.log('result', result);

    // Nếu output là string thì giữ nguyên, nếu là object thì chuyển thành array
    if (Array.isArray(result.output)) {
      return { output: result.output };
    }
    return { output: String(result.output ?? '') };
  }
}

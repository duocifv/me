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
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class AgentService implements OnModuleInit {
  private agentExecutor: AgentExecutor;
  private chain: RunnableSequence;
  constructor(
    private readonly llm: LLMService,
    private readonly rag: RAGService,
  ) {}

  async onModuleInit() {
    // const tools = [
    //   checkStockTool,
    //   getPriceTool,
    //   searchTool,
    //   ragSearchTool(this.rag),
    // ];

    // Prompt yêu cầu Gemini chọn tool
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `Bạn là trợ lý thông minh. Chọn tool phù hợp và trả về kết quả cuối cùng cho người dùng.
         Tool có sẵn: 
         - search
         - ragSearch
         - checkStock
         - getPrice
         
         ⚠️ Chỉ trả về text (không trả JSON, không trả object).`,
      ],
      ['human', '{input}'],
    ]);

    this.chain = RunnableSequence.from([
      prompt,
      this.llm.gemini, // ✅ Gemini
      new StringOutputParser(), // ép luôn output thành string
    ]);

    // const agent = await createOpenAIFunctionsAgent({
    //   llm: this.llm.gemini, // LLMService trả về model
    //   tools,
    //   prompt,
    // });

    // this.agentExecutor = new AgentExecutor({
    //   agent,
    //   tools,
    // });
  }

  async run(query: string): Promise<{ output: string }> {
    try {
      const thought = await this.chain.invoke({ input: query });
      console.log('🤖 LLM chọn:', thought);

      // Ví dụ LLM có thể trả: "Dùng tool getPrice với input: Powder Canister"
      let output = '';
      if (thought.includes('getPrice')) {
        output = await getPriceTool.invoke(query);
      } else if (thought.includes('checkStock')) {
        output = await checkStockTool.invoke(query);
      } else if (thought.includes('ragSearch')) {
        output = await ragSearchTool(this.rag).invoke(query);
      } else if (thought.includes('search')) {
        output = await searchTool.invoke(query);
      } else {
        output = thought; // fallback: trả thẳng câu trả lời LLM
      }

      return { output: String(output) };
    } catch (err) {
      console.error('invoke error:', err);
      return { output: 'Xin lỗi, tôi gặp lỗi khi xử lý.' };
    }
  }
}

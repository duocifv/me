// ai/agent.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { RAGService } from './rag.service';
import {
  checkStockTool,
  getPriceTool,
  ragSearchTool,
  searchTool,
} from './mcp.service';
import { LLMService } from './llm.service';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

interface ToolStep {
  tool: 'search' | 'ragSearch' | 'checkStock' | 'getPrice';
  input?: string; // input do LLM chỉ định
  input_from_previous?: boolean; // nếu input lấy từ kết quả bước trước
}

@Injectable()
export class AgentService implements OnModuleInit {
  private chain: RunnableSequence;

  constructor(
    private readonly llm: LLMService,
    private readonly rag: RAGService,
  ) {}

  onModuleInit() {
    // Prompt Gemini quyết định sequence tool
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `Bạn là trợ lý thông minh. Chọn tool phù hợp và trả về kết quả cuối cùng cho người dùng.
Tool có sẵn: search, ragSearch, checkStock, getPrice.
⚠️ Chỉ trả về text (không trả JSON, không trả object).`,
      ],
      ['human', '{input}'], // placeholder {input}
    ]);

    this.chain = RunnableSequence.from([
      prompt,
      this.llm.gemini,
      new StringOutputParser(),
    ]);
  }

  async run(sequence: ToolStep[]): Promise<ToolStep | string> {
    let prevResult: any = null;

    for (const step of sequence) {
      let input = step.input ?? '';
      if (step.input_from_previous && prevResult) {
        input = prevResult;
      }

      switch (step.tool) {
        case 'getPrice':
          prevResult = await getPriceTool.invoke(input);
          break;
        case 'checkStock':
          prevResult = await checkStockTool.invoke(input);
          break;
        case 'ragSearch':
          prevResult = await ragSearchTool(this.rag).invoke(input);
          break;
        case 'search':
          prevResult = await searchTool.invoke(input);
          break;
        default:
          prevResult = `Tool không xác định: ${step.tool}`;
      }
    }
    // console.log('prevResult', prevResult);
    return String(prevResult ?? 'Không có kết quả');
  }
}

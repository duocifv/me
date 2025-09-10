// ai/agent.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { LLMService } from './llm.service';
import { checkStockTool } from '../tools/checkStock.tool';
import { getPriceTool } from '../tools/getPrice.tool';
import { searchTool } from '../tools/search.tool';
import { Document } from 'langchain/document';

@Injectable()
export class AgentService implements OnModuleInit {
  private readonly logger = new Logger(AgentService.name);
  private agentExecutor: AgentExecutor | null = null;

  constructor(private readonly llm: LLMService) {}

  onModuleInit() {
    try {
      const tools = [checkStockTool, getPriceTool, searchTool];

      const model = this.llm.gemini;

      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          `
           You are a smart assistant that can use tools to answer questions.
           :warning: IMPORTANT: Always use the following workflow for product queries (price/stock):
           1) Call the tool "rag_search" with { "query": "<user query>" } to find candidate products and their IDs.
           2) If rag_search returns an ID, call "check_stock" with { "id": <number> } for inventory or "get_price" with { "id": <number> } for price, depending on the intent.
           3) Always synthesize a final concise answer after retrieving data from tools.

           Do NOT answer directly without using the tools if the question involves product data.
           Output should be concise and factual.
           `,
        ],
        ['placeholder', '{chat_history}'],
        ['human', '{input}'],
        ['placeholder', '{agent_scratchpad}'],
      ]);

      // Tạo agent kiểu tool-calling
      const agent = createToolCallingAgent({
        llm: model,
        tools,
        prompt,
      });

      // Tạo executor để chạy agent
      this.agentExecutor = new AgentExecutor({
        agent,
        tools,
        verbose: true,
      });

      this.logger.log('AgentExecutor initialized successfully.');
    } catch (err) {
      this.logger.error('Failed to initialize AgentExecutor', err);
    }
  }

  /**
   * Chạy workflow tool-calling
   */
  async run(question: string): Promise<string> {
    if (!this.agentExecutor) {
      throw new Error('AgentExecutor not initialized.');
    }

    try {
      const res = await this.agentExecutor.invoke({ input: question });

      if (!res) return 'No response from agent';
      if (typeof res === 'string') return res;
      if ('output_text' in res && typeof res.output_text === 'string')
        return res.output_text;
      if ('output' in res && typeof res.output === 'string') return res.output;

      return JSON.stringify(res);
    } catch (err) {
      this.logger.error('Agent run error', err);
      return 'Đã có lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.';
    }
  }

  /**
   * Chạy nhiều câu hỏi con
   */
  async runMultiple(subs: string[]): Promise<string[]> {
    const results: string[] = [];
    for (const sub of subs) {
      const res = await this.run(sub);
      results.push(res);
    }
    return results;
  }

  /**
   * QA trực tiếp từ RAG/Chroma bằng LLMService
   */
  async qa(
    query: string,
    retriever: { getRelevantDocuments: (q: string) => Promise<Document[]> },
  ) {
    try {
      const answer = await this.llm.qa(query, retriever);
      return answer;
    } catch (err) {
      this.logger.error('QA error', err);
      return 'Đã có lỗi khi truy vấn dữ liệu.';
    }
  }
}

import { LLMService } from './llm.service';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { Injectable } from '@nestjs/common';
import { PromptService } from './prompt.service';

@Injectable()
export class ReasoningService {
  constructor(
    private readonly llm: LLMService,
    private readonly prompt: PromptService,
  ) {}

  /**
   * Phase 1: Phân rã câu hỏi thành sub-questions
   */

  async decomposeQuestion(q: string): Promise<string[]> {
    const chain = RunnableSequence.from([
      this.prompt.splitQuestion(),
      this.llm.gemini,
      new StringOutputParser(),
    ]);

    const raw = await chain.invoke({ question: q });

    const cleaned = raw
      .replace(/```json/i, '')
      .replace(/```/g, '')
      .trim();
    try {
      const parsed: string[] = JSON.parse(cleaned);
      return parsed;
    } catch {
      return [];
    }
  }
}

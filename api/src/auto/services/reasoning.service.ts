// ai/reasoning.service.ts
import { LLMService } from './llm.service';

export class ReasoningService {
  private llm = new LLMService();

  async decomposeQuestion(q: string) {
    const prompt = `Hãy chia nhỏ câu hỏi thành các sub-question nếu cần: "${q}"`;
    const result = await this.llm.chat([prompt]);
    return result;
  }
}

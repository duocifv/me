import { LLMService } from './llm.service';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';

export class ReasoningService {
  private llm = new LLMService();

  async decomposeQuestion(q: string): Promise<string[]> {
    const prompt = ChatPromptTemplate.fromTemplate(
      `Chia nhỏ câu hỏi thành các sub-question (nếu cần).
      Trả về JSON array string[] duy nhất, không thêm mô tả:
      Câu hỏi: {question}`,
    );

    const chain = RunnableSequence.from([
      prompt,
      this.llm.gemini,
      new StringOutputParser(),
    ]);

    const raw = await chain.invoke({ question: q });
    // Ưu tiên parse JSON chuẩn
    try {
      const cleaned = raw
        .replace(/```json/i, '')
        .replace(/```/g, '')
        .trim();
      const arr = JSON.parse(cleaned);
      if (Array.isArray(arr)) {
        return arr
          .map((s) => (typeof s === 'string' ? s.trim() : ''))
          .filter(Boolean)
          .slice(0, 5);
      }
    } catch {
      // fallback tách theo dòng
      return raw
        .split(/\r?\n/)
        .map((s) => s.replace(/^[\s>*\-•\d.)]+\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 5);
    }

    return [];
  }
}

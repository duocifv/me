// ai/orchestrator.service.ts
import { Injectable } from '@nestjs/common';
import { RAGService } from './rag.service';
import { ChatResponseDto, ChatResultDto } from '../dto/auto.dto';
import { AgentService } from './agent.service';
import { ReasoningService } from './reasoning.service';

@Injectable()
export class OrchestratorService {
  constructor(
    private readonly agent: AgentService,
    private readonly rag: RAGService,
    private readonly reasoning: ReasoningService,
  ) {}

  private cache = new Map<string, { result: ChatResponseDto; ts: number }>();
  private readonly TTL = 60 * 1000; // 1 phút

  async handleUserQuery(q: string): Promise<ChatResponseDto> {
    // 1️⃣ Kiểm duyệt nhanh
    if (/hack|xxx/i.test(q)) {
      return {
        query: q,
        steps: [],
        result: [],
        evaluation: 'Xin lỗi, tôi không thể trả lời câu hỏi này.',
      };
    }

    // 2️⃣ Cache
    const cached = this.cache.get(q);
    if (cached && Date.now() - cached.ts < this.TTL) return cached.result;

    // 3️⃣ Gọi ReasoningService để phân rã câu hỏi
    const steps = await this.reasoning.decomposeQuestion(q);
    console.log('steps', steps);
    const results: any[] = [];
    for (const step of steps) {
      console.log('step', step);
      const res = await this.agent.run(step);
      results.push(res.output);
    }

    // 4️⃣ Nếu không có sản phẩm
    if (!results.length) {
      const response: ChatResponseDto = {
        query: q,
        steps,
        result: [{ price: null, stock: null, reviews: [] }],
        evaluation: 'Không tìm thấy sản phẩm',
      };
      this.cache.set(q, { result: response, ts: Date.now() });
      return response;
    }

    // 5️⃣ Lưu vào RAG
    for (const p of results) {
      if (p?.id && p?.title) {
        await this.rag.addDocument(p.id.toString(), p.title);
      }
    }

    // 6️⃣ Lấy chi tiết sản phẩm đầu tiên
    const productId = results[0].id;
    const [inv, rev] = await Promise.all([
      this.agent.run(`Check stock and price for ${productId}`),
      this.agent.run(`Get reviews for ${productId}`),
    ]);

    // 7️⃣ Kết quả enriched
    const enriched: ChatResultDto[] = [
      {
        price: (inv?.output as any)?.price ?? null,
        stock: (inv?.output as any)?.stock ?? null,
        reviews: Array.isArray(rev?.output) ? (rev.output as any) : [],
      },
    ];

    // 8️⃣ Trả về + cache
    const response: ChatResponseDto = {
      query: q,
      steps,
      result: enriched,
      evaluation: 'Đáp án có độ tin cậy cao ✅',
    };
    this.cache.set(q, { result: response, ts: Date.now() });

    return response;
  }
}

// ai/orchestrator.service.ts
import { Injectable } from '@nestjs/common';
import { RAGService } from './rag.service';
import { ChatResponseDto, ChatResultDto } from '../dto/auto.dto';
import { AgentService } from './agent.service';
import { ReasoningService } from './reasoning.service';
import { UpsertPayload } from '../type/upsert.type';

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
    const raws = await this.agent.run(steps);
    const once = JSON.parse(raws as any);
    const twice = JSON.parse(once.itemId);
    const thrice = JSON.parse(twice.itemId);

    const result: UpsertPayload = {
      items: [
        {
          id: 'doc15',
          document: 'Hello 1212',
          metadata: {
            category: 'Hello',
            author: 'Hello',
          },
        },
      ],
    };

    console.log(result);
    await this.rag.addDocument(result);
    console.log('res', result, thrice);
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
    // for (const p of results) {
    //   if (p?.id && p?.title) {
    //     await this.rag.addDocument(p.id.toString(), p.title);
    //   }
    // }

    // 6️⃣ Lấy chi tiết sản phẩm đầu tiên
    // const productId = results[0].id;
    // const [inv, rev] = await Promise.all([
    //   this.agent.run(`Check stock and price for ${productId}`),
    //   this.agent.run(`Get reviews for ${productId}`),
    // ]);

    // 7️⃣ Kết quả enriched
    const enriched: ChatResultDto[] = [
      {
        price: 100,
        stock: 100,
        reviews: [],
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

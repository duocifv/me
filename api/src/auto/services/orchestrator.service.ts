// ai/orchestrator.service.ts
import { Injectable } from '@nestjs/common';
import { AgentService } from './agent.service';
import { ReasoningService } from './reasoning.service';
import { RAGService } from './rag.service';
import { ChatResponseDto, ChatResultDto } from '../dto/auto.dto';

@Injectable()
export class OrchestratorService {
  constructor(
    private readonly agent: AgentService,
    private readonly reasoning: ReasoningService,
    private readonly rag: RAGService,
  ) {}

  private queryCache = new Map<
    string,
    { result: ChatResponseDto; timestamp: number }
  >();
  private readonly CACHE_TTL = 60 * 1000; // 1 phút

  async handleUserQuery(q: string): Promise<ChatResponseDto> {
    // 1️⃣ Filter nội dung cấm
    if (q.includes('hack') || q.includes('xxx')) {
      return {
        query: q,
        steps: [],
        result: [],
        evaluation: 'Xin lỗi, tôi không thể trả lời câu hỏi này.',
      };
    }

    // 2️⃣ Check cache
    const cached = this.queryCache.get(q);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }

    // 3️⃣ Self-Ask / Reasoning: chia nhỏ vấn đề
    const steps = (await this.reasoning.decomposeQuestion(q)) ?? [];
    const stepResults: any[] = [];

    // 4️⃣ Multi-Turn Reasoning: xử lý từng step
    for (const step of steps) {
      const searchResults = await this.agent.collaborate({ SalesAgent: step });
      const products =
        searchResults.find((r) => r.agent === 'SalesAgent')?.result || [];
      stepResults.push({ step, products });
    }

    // 5️⃣ Gộp tất cả products từ các step
    const allProducts = stepResults.flatMap((r) => r.products);

    // 6️⃣ Lưu embedding RAG (chỉ demo, không lưu trùng)
    for (const prod of allProducts) {
      await this.rag.addDocument(prod.title);
    }

    if (allProducts.length === 0) {
      const response: ChatResponseDto = {
        query: q,
        steps: [...steps],
        result: [{ price: null, stock: null, reviews: [] }],
        evaluation: 'Không tìm thấy sản phẩm',
      };
      this.queryCache.set(q, { result: response, timestamp: Date.now() });
      return response;
    }

    // 7️⃣ Lấy itemId của sản phẩm đầu tiên
    const productId = allProducts[0].id;

    // 8️⃣ Gọi InventoryAgent
    const inventoryResults = await this.agent.collaborate({
      InventoryAgent: [productId],
    });
    const inventory =
      inventoryResults.find((r) => r.agent === 'InventoryAgent')?.result || [];

    // 9️⃣ Gọi ReviewAgent
    const reviewResults = await this.agent.collaborate({
      ReviewAgent: [productId],
    });
    const reviews = reviewResults[0]?.result ?? [];

    // 10️⃣ Enrich kết quả
    const enriched: ChatResultDto[] = inventory.map((item) => ({
      price: item.price ?? null,
      stock: item.stock ?? null,
      reviews,
    }));

    // 11️⃣ Trả về và lưu cache
    const response: ChatResponseDto = {
      query: q,
      steps: [...steps],
      result: enriched,
      evaluation: 'Đáp án có độ tin cậy cao ✅',
    };
    this.queryCache.set(q, { result: response, timestamp: Date.now() });

    return response;
  }
}

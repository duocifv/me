// ai/rag.service.ts
import { ConfigService } from '@nestjs/config';
import { LLMService } from './llm.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { LiteEmbedding } from 'src/sqlite/lite-embedding.entity';
import { Repository } from 'typeorm';
import axios from 'axios';

@Injectable()
export class RAGService {
  private llm = new LLMService();

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(LiteEmbedding, 'sqlite')
    private readonly embeddingRepo: Repository<LiteEmbedding>,
  ) {}

  // Thêm document vào DB + embedding
  async addDocument(text: string) {
    const embedding = await this.llm.embed(text);
    const item = new LiteEmbedding();
    item.text = text;
    item.vector = JSON.stringify(embedding);
    await this.embeddingRepo.save(item);
  }
  // Lấy tất cả document đã lưu
  async getDocuments() {
    const rows = await this.embeddingRepo.find();
    return rows.map((r) => ({
      text: r.text,
      vector: JSON.parse(r.vector) as number[],
    }));
  }

  // Search dựa trên embedding + trả về products từ DummyJSON
  async search(query: string, topK = 3) {
    const qVec = await this.llm.embed(query);
    console.log("qVec", qVec)
    // 1️⃣ Lấy tất cả sản phẩm từ DummyJSON
    const { data } = await axios.get('https://dummyjson.com/products');
    const products = data.products;

    // 2️⃣ Gắn score bằng cosine similarity với embedding nếu có trong DB
    const rows = await this.embeddingRepo.find();
    console.log("qVec rows", rows)
    const scored: any[] = products.map((prod: any) => {
      // tìm embedding tương ứng
      const embRow = rows.find(
        (r) => r.text.toLowerCase() === prod.title.toLowerCase(),
      );
      let score = 0;
      if (embRow) {
        const vec = JSON.parse(embRow.vector) as number[];
        score = this.cosineSimilarity(qVec, vec);
      }
      return { ...prod, score };
    });

    // 3️⃣ Sắp xếp theo score giảm dần và topK
    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  // Lấy sản phẩm theo id
  async getById(id: number) {
    const { data } = await axios.get(`https://dummyjson.com/products/${id}`);
    return data;
  }

  private cosineSimilarity(a: number[], b: number[]) {
    const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const normA = Math.sqrt(a.reduce((s, ai) => s + ai * ai, 0));
    const normB = Math.sqrt(b.reduce((s, bi) => s + bi * bi, 0));
    return dot / (normA * normB);
  }
}

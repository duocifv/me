import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMService } from './llm.service';
import { Pinecone } from '@pinecone-database/pinecone';
import axios from 'axios';

@Injectable()
export class RAGService {
  private llm: LLMService;
  private pinecone: Pinecone;
  private index: any;
  private indexName = 'novu';

  constructor(private readonly config: ConfigService) {
    this.llm = new LLMService();

    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.index = this.pinecone.index(this.indexName);
  }

  /** 1️⃣ Tạo index nếu chưa có (với integrated model) */
  async initIndex() {
    const indexes = await this.pinecone.listIndexes();
    const exists = indexes.indexes?.find((i) => i.name === this.indexName);

    if (!exists) {
      await this.pinecone.createIndexForModel({
        name: this.indexName,
        cloud: 'aws',
        region: 'us-east-1',
        embed: {
          model: 'llama-text-embed-v2',
          fieldMap: { text: 'chunk_text' },
        },
        waitUntilReady: true,
      });
    }
  }

  /** 2️⃣ Load data từ API vào Pinecone */
  async loadProductsFromAPI() {
    await this.initIndex();

    const { data } = await axios.get('https://dummyjson.com/products');
    const products = data.products;

    await this.index.namespace('default').upsert(
      products.map((p: any) => ({
        id: p.id.toString(),
        metadata: {
          chunk_text: p.title,
          price: p.price,
          stock: p.stock,
        },
      })),
    );
  }

  /** 3️⃣ Thêm document mới */
  async addDocument(id: string, text: string) {
    await this.initIndex();

    await this.index.namespace('default').upsert([
      {
        id,
        values: {}, // để trống → Pinecone tự embed
        metadata: {
          chunk_text: text,
        },
      },
    ]);
  }

  /** 4️⃣ Query */
  async search(query: string, topK = 3) {
    await this.initIndex();

    const result = await this.index.namespace('default').query({
      topK,
      includeMetadata: true,
      query: { text: query }, // Pinecone tự embed
    });

    const docs = result.matches.map((m: any) => m.metadata.chunk_text);

    const llmAnswer = await this.llm.chat([query, docs.join('\n')]);

    return { rawResult: result, documents: docs, llmAnswer };
  }
}

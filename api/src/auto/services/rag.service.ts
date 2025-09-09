// src/auto/services/rag.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { LLMService } from './llm.service';
import { ToolStep } from '../type/tool-step.type';
import { UpsertPayload } from '../type/upsert.type';

type UpsertItem = {
  id: string;
  document: string;
  metadata?: Record<string, any>;
};

@Injectable()
export class RAGService {
  private readonly logger = new Logger(RAGService.name);
  private readonly http: AxiosInstance;
  private readonly llm: LLMService;
  private readonly batchSize: number;

  constructor(
    llm: LLMService, // inject LLMService từ NestJS container
  ) {
    this.llm = llm;
    const baseUrl =
      process.env.CHROMA_API_URL || 'https://nvduocfpt-chroma-space.hf.space';

    this.http = axios.create({
      baseURL: baseUrl,
      timeout: 10_000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.batchSize = Number(50);
  }

  /**
   * Load products from dummyjson and upsert into Chroma via /upsert
   */
  async loadProductsFromAPI(
    dummyProductsUrl = 'https://dummyjson.com/products',
  ) {
    try {
      const { data } = await axios.get(dummyProductsUrl, { timeout: 10_000 });
      const products = Array.isArray(data?.products) ? data.products : [];
      const items: UpsertItem[] = products.map((p: any) => ({
        id: String(p.id),
        document: (p.title ?? '') + (p.description ? `\n${p.description}` : ''),
        metadata: { price: p.price, stock: p.stock, title: p.title },
      }));

      for (let i = 0; i < items.length; i += this.batchSize) {
        const chunk = items.slice(i, i + this.batchSize);
        console.log('chunk', chunk);
        // FIX: gửi trực tiếp array thay vì { items: chunk }
        await this.http.post('/upsert', { items: chunk });
      }

      return { ok: true, count: items.length };
    } catch (err) {
      //this.logger.error('loadProductsFromAPI error', err);
      return { ok: false, error: err.toString?.() ?? 'unknown' };
    }
  }

  /**
   * Upsert a single document
   */
  async addDocument(data: UpsertPayload) {
    try {
      await this.http.post('/upsert', data);
      return { ok: true };
    } catch (err) {
      this.logger.error('addDocument error', err);
      return { ok: false, error: err.toString?.() ?? 'unknown' };
    }
  }

  /**
   * Query Chroma via /query, then optionally synthesize with injected LLMService
   */
  async search(query: string, topK = 3) {
    try {
      const resp = await this.http.post('/query', {
        query,
        n_results: topK,
      });

      const payload = resp.data?.result;
      if (!payload) {
        return {
          rawResult: null,
          documents: [],
          metadatas: [],
          ids: [],
          distances: [],
          llmAnswer: null,
        };
      }

      // Chroma returns nested arrays per query; we assume single-query and take index 0
      const documents: string[] =
        (payload.documents && payload.documents[0]) || [];
      const metadatas: any[] =
        (payload.metadatas && payload.metadatas[0]) || [];
      const ids: string[] = (payload.ids && payload.ids[0]) || [];
      const distances: number[] =
        (payload.distances && payload.distances[0]) || [];

      // build context and call LLMService to synthesize (adjust to your LLMService API)
      const context = documents.join('\n\n---\n\n');
      let llmAnswer: string | null = null;
      try {
        // adapt to your LLMService: chat(messages) or generate(prompt)
        // here we try common patterns; adjust if your LLMService exposes different method
        if (typeof (this.llm as any).chat === 'function') {
          llmAnswer = await (this.llm as any).chat([query, context]);
        } else if (typeof (this.llm as any).generate === 'function') {
          llmAnswer = (
            await (this.llm as any).generate(context + '\n\n' + query)
          ).toString();
        } else {
          // fallback: return context only
          llmAnswer = null;
        }
      } catch (e) {
        this.logger.warn('LLM synthesis failed', e);
      }

      return {
        rawResult: payload,
        documents,
        metadatas,
        ids,
        distances,
        llmAnswer,
      };
    } catch (err) {
      this.logger.error('search error', err);
      return {
        rawResult: null,
        documents: [],
        metadatas: [],
        ids: [],
        distances: [],
        llmAnswer: null,
        error: err.toString?.() ?? 'unknown',
      };
    }
  }
}

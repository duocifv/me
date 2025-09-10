// src/auto/services/rag.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { LLMService } from './llm.service';
import { UpsertPayload } from '../type/upsert.type';
import { ChromaQueryResult } from '../type/chroma-query.type';
import { Document } from 'langchain/document';

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
  async search(
    queries: string[] | string,
    topK = 3,
  ): Promise<{
    documentsByQuery: string[][];
    metadatasByQuery: any[][];
    idsByQuery: (string | number)[][];
    distancesByQuery: number[][];
  }> {
    try {
      const queriesArr = Array.isArray(queries) ? queries : [queries];

      const resp = await this.http.post<ChromaQueryResult>('/query', {
        queries: queriesArr,
        n_results: topK,
      });

      const payload = resp.data?.result;
      if (!payload) {
        // return empty arrays per query
        return {
          documentsByQuery: queriesArr.map(() => []),
          metadatasByQuery: queriesArr.map(() => []),
          idsByQuery: queriesArr.map(() => []),
          distancesByQuery: queriesArr.map(() => []),
        };
      }

      // Chroma returns nested arrays per query
      const documentsByQuery: string[][] = (payload.documents || []).map(
        (arr: any) => (Array.isArray(arr) ? arr : []),
      );
      const metadatasByQuery: any[][] = (payload.metadatas || []).map(
        (arr: any) => (Array.isArray(arr) ? arr : []),
      );
      const idsByQuery: (string | number)[][] = (payload.ids || []).map(
        (arr: any) => (Array.isArray(arr) ? arr : []),
      );
      const distancesByQuery: number[][] = (payload.distances || []).map(
        (arr: any) => (Array.isArray(arr) ? arr : []),
      );

      return {
        documentsByQuery,
        metadatasByQuery,
        idsByQuery,
        distancesByQuery,
      };
    } catch (err) {
      this.logger.error('search error', err);
      return {
        documentsByQuery: [] as string[][],
        metadatasByQuery: [] as any[][],
        idsByQuery: [] as (string | number)[][],
        distancesByQuery: [] as number[][],
      };
    }
  }
}

export class RAGRetriever {
  constructor(
    private rag: RAGService,
    private topK = 5,
  ) {}

  async getRelevantDocuments(query: string): Promise<Document[]> {
    const { documentsByQuery, metadatasByQuery } = await this.rag.search(
      query,
      this.topK,
    );

    const docs: Document[] = (documentsByQuery[0] || []).map((text, i) => ({
      pageContent: text,
      metadata: metadatasByQuery[0]?.[i] || {},
    }));

    return docs;
  }
}

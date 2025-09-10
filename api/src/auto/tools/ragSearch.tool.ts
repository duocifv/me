// tools/ragSearch.tool.ts
import { RAGService } from '../services/rag.service';
import { createToolAny } from './tool-helper';

export function createRagSearchTool(rag: RAGService) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return createToolAny(
    async ({ query, topK }: { query: string; topK?: number }) => {
      const k = topK ?? 3;
      // call your RAGService.search which should return per-query docs/ids
      const res = await rag.search([query], k);
      // return a structured array of candidates (id, title, snippet)
      const docs = res.documentsByQuery?.[0] ?? [];
      const metas = res.metadatasByQuery?.[0] ?? [];
      const ids = res.idsByQuery?.[0] ?? [];
      const candidates = docs.map((d: any, i: number) => ({
        id: ids[i] ?? null,
        title:
          (metas[i]?.title ?? null) ||
          (typeof d === 'string' ? d.slice(0, 200) : null),
        snippet: d,
        meta: metas[i] ?? null,
      }));
      return candidates;
    },
    {
      name: 'rag_search',
      description:
        'Search internal vector DB for product candidates. Input: { query:string, topK?: number }',
    },
  );
}

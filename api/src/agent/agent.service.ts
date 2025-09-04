import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

import { Document, VectorStoreIndex } from 'llamaindex';
import * as fs from 'fs';
import * as path from 'path';

import { LiteBlog } from 'src/sqlite/lite-blog.entity';

type SimpleDoc = { id: string; text: string; metadata?: Record<string, any> };

@Injectable()
export class AgentService implements OnModuleInit {
    private chain: RunnableSequence | null = null;
    private queryEngine: any | null = null;

    // fallback local documents for keyword search
    private simpleDocs: SimpleDoc[] = [];

    constructor(
        @InjectRepository(LiteBlog, 'sqlite')
        private blogRepo: Repository<LiteBlog>,
    ) { }

    async onModuleInit() {
        await this.initChain();
        await this.initLlama(); // builds either vector index or fallback keyword index
    }

    // --- LangChain chain with JsonOutputParser ---
    private async initChain() {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('⚠️ GEMINI_API_KEY not set — Gemini model may not work.');
        }

        const model = new ChatGoogleGenerativeAI({
            model: 'gemini-1.5-flash',
            apiKey: process.env.GEMINI_API_KEY ?? '',
        });

        const prompt = ChatPromptTemplate.fromTemplate(`
Bạn là AI writer. Viết blog JSON dựa trên chủ đề: "{topic}".
- Context tham khảo: {context}
- JSON có các trường:
  - title: tiêu đề bài viết
  - intro: đoạn giới thiệu ngắn
  - items: danh sách 3-5 mục, mỗi mục có title và description
- Trả về JSON hợp lệ, không thêm text khác
    `);

        const parser = new JsonOutputParser();
        this.chain = RunnableSequence.from([prompt, model, parser]);
    }

    // --- Build index: try VectorStoreIndex, else fallback to keyword index ---
    private async initLlama() {
        const candidates = [
            path.resolve(process.cwd(), 'data'),
            path.resolve(process.cwd(), 'src', 'agent', 'data'),
            path.resolve(__dirname, 'data'),
            path.resolve(__dirname, '..', 'data'),
        ];

        console.log('LlamaIndex — checking candidate data paths:');
        candidates.forEach((p) => console.log('  -', p));

        const dirPath = candidates.find((p) => fs.existsSync(p) && fs.statSync(p).isDirectory());

        if (!dirPath) {
            console.warn('⚠️ data/ folder not found — skipping LlamaIndex init and fallback to empty docs');
            this.simpleDocs = [];
            this.queryEngine = this.buildKeywordQueryEngine(); // empty engine
            return;
        }

        console.log('LlamaIndex dirPath:', dirPath);

        const files = fs.readdirSync(dirPath).filter((f) => fs.statSync(path.join(dirPath, f)).isFile());
        if (files.length === 0) {
            console.warn('⚠️ data/ is empty — skipping LlamaIndex init');
            this.simpleDocs = [];
            this.queryEngine = this.buildKeywordQueryEngine();
            return;
        }

        // read docs
        const documents: Document[] = files.map((file) => {
            const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
            return new Document({ text: content, metadata: { source: file } });
        });

        // try vector index (may throw if embedModel not set)
        try {
            const index = await VectorStoreIndex.fromDocuments(documents);
            this.queryEngine = index.asQueryEngine();
            console.log('✅ VectorStoreIndex built — using vector queryEngine');
            return;
        } catch (err) {
            console.warn('⚠️ Could not build VectorStoreIndex (will fallback to keyword index).');
            console.warn('Details:', (err as any)?.message ?? err);
            // build simple docs array for keyword search fallback
            this.simpleDocs = files.map((file) => {
                const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
                return { id: file, text: content, metadata: { source: file } };
            });
            this.queryEngine = this.buildKeywordQueryEngine();
            console.log('✅ Fallback keyword index is ready (no embeddings required)');
        }
    }

    // --- simple keyword query engine ---
    private buildKeywordQueryEngine() {
        // returns object with same .query API used earlier
        return {
            query: async ({ query }: { query: string }) => {
                if (!query || this.simpleDocs.length === 0) return { response: '' };

                const qTokens = this.tokenize(query);
                const scores = this.simpleDocs.map((d) => {
                    const text = d.text.toLowerCase();
                    let score = 0;
                    for (const t of qTokens) {
                        // count occurrences roughly
                        let idx = text.indexOf(t);
                        while (idx !== -1) {
                            score += 1;
                            idx = text.indexOf(t, idx + t.length);
                        }
                    }
                    return { doc: d, score };
                });

                // sort by score desc
                scores.sort((a, b) => b.score - a.score);

                // take top 3 non-zero
                const top = scores.filter(s => s.score > 0).slice(0, 3);
                if (top.length === 0) {
                    // no match — fallback to returning short concatenation of first 2 docs
                    const fallback = this.simpleDocs.slice(0, 2).map(d => `Source: ${d.id}\n${this.truncate(d.text, 400)}`).join('\n\n');
                    return { response: fallback };
                }

                const response = top.map(s => `Source: ${s.doc.id}\n${this.truncate(s.doc.text, 800)}`).join('\n\n');
                return { response };
            }
        };
    }

    private tokenize(text: string) {
        return text.toLowerCase().split(/\W+/).filter(Boolean).map(t => t.length > 2 ? t : t); // keep short tokens too
    }

    private truncate(text: string, maxLen: number) {
        if (!text) return '';
        if (text.length <= maxLen) return text;
        return text.slice(0, maxLen) + '...';
    }

    // --- Generate blog: will use context from either vector queryEngine or keyword fallback ---
    async generateBlog(topic: string): Promise<LiteBlog> {
        if (!this.chain) throw new Error('LLM chain not initialized');

        // get context
        let context = '';
        if (this.queryEngine) {
            try {
                const ctx = await this.queryEngine.query({ query: topic });
                context = ctx?.response ?? '';
            } catch (err) {
                console.warn('⚠️ Error querying index — continuing with empty context:', (err as any)?.message ?? err);
                context = '';
            }
        }

        // call chain
        let data: any;
        try {
            data = await this.chain.invoke({ topic, context });
        } catch (err) {
            console.error('❌ Error invoking LLM chain:', err);
            throw new Error('Failed to generate blog from AI');
        }

        // chain.invoke may return parsed object or string, handle both
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch { throw new Error('LLM returned invalid JSON'); }
        } else if (data && typeof data === 'object' && 'text' in data && typeof data.text === 'string') {
            try { data = JSON.parse(data.text); } catch { /* leave as-is */ }
        }

        const title = data?.title ?? topic;
        const intro = data?.intro ?? '';
        const items = Array.isArray(data?.items) ? data.items : [];

        const blog = this.blogRepo.create({ title, intro, items });
        return this.blogRepo.save(blog);
    }

    async getAllBlogs(): Promise<LiteBlog[]> {
        return this.blogRepo.find({ order: { createdAt: 'DESC' } });
    }
}

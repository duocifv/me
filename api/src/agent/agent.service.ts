import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { LiteBlog } from 'src/sqlite/lite-blog.entity';
// LangChain v0.3 imports (runnables + parsers + models + memory + tools)
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { BufferMemory } from 'langchain/memory';
import { SerpAPI } from '@langchain/community/tools/serpapi';

// LlamaIndex imports (kept as before)
import { Document, VectorStoreIndex } from 'llamaindex';
import { Runnable } from '@langchain/core/runnables';
import * as z from 'zod';

// Schema khớp với LiteBlog (title, intro, items[])
export const blogParser = StructuredOutputParser.fromZodSchema(
  z.object({
    title: z.string().describe('Tiêu đề bài blog'),
    intro: z.string().describe('Đoạn mở đầu (60–120 từ)'),
    items: z
      .array(
        z.object({
          subheading: z.string().describe('Tiêu đề mục con'),
          paragraph: z.string().describe('Nội dung đoạn văn cho mục con'),
        }),
      )
      .describe('Danh sách các mục nội dung'),
  }),
);

type SimpleDoc = { id: string; text: string; metadata?: Record<string, any> };

interface QueryEngine {
  query: (args: { query: string }) => Promise<{ response: string }>;
}

@Injectable()
export class AgentService implements OnModuleInit {
  private draftRunnable: Runnable | null = null;
  private seoRunnable: Runnable | null = null;
  private memory: BufferMemory | null = null;
  private queryEngine: QueryEngine | null = null;
  private simpleDocs: SimpleDoc[] = [];

  constructor(
    @InjectRepository(LiteBlog, 'sqlite')
    private blogRepo: Repository<LiteBlog>,
  ) {}

  async onModuleInit() {
    this.initLLMRunnables();
    this.initMemory();
    await this.initLlama();
  }

  // --- 1. Prompt Templates + Runnables (thay LLMChain) ---
  private initLLMRunnables() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY not set — Gemini model may not work.');
    }

    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      apiKey: process.env.GEMINI_API_KEY ?? '',
    });

    // Create parser first so we can include format instructions in prompts
    const draftPrompt = ChatPromptTemplate.fromTemplate(`
You are a professional Vietnamese content writer. 
Write a full Vietnamese blog post about: "{topic}".
Reference context: {context}

${blogParser.getFormatInstructions()}
`);

    const seoPrompt = ChatPromptTemplate.fromTemplate(`
Optimize this blog for SEO while keeping a friendly Vietnamese tone. 
Input draft JSON: {draft}

${blogParser.getFormatInstructions()}
Return optimized JSON with same structure.
`);
    // Build runnables: pipe prompt -> model so we can call .invoke({ ...inputs })
    this.draftRunnable = draftPrompt.pipe(model).pipe(blogParser);
    this.seoRunnable = seoPrompt.pipe(model).pipe(blogParser);
  }

  // --- 2. Memory (simple BufferMemory) ---
  private initMemory() {
    this.memory = new BufferMemory({ memoryKey: 'chat_history' });
  }

  // --- 3. LlamaIndex / fallback keyword ---
  private async initLlama() {
    const candidates = [
      path.resolve(process.cwd(), 'data'),
      path.resolve(process.cwd(), 'src', 'agent', 'data'),
      path.resolve(__dirname, 'data'),
      path.resolve(__dirname, '..', 'data'),
    ];

    const dirPath = candidates.find(
      (p) => fs.existsSync(p) && fs.statSync(p).isDirectory(),
    );

    if (!dirPath) {
      console.warn('⚠️ data/ folder not found — fallback to empty docs');
      this.simpleDocs = [];
      this.queryEngine = this.buildKeywordQueryEngine();
      return;
    }

    const files = fs
      .readdirSync(dirPath)
      .filter((f) => fs.statSync(path.join(dirPath, f)).isFile());

    if (files.length === 0) {
      this.simpleDocs = [];
      this.queryEngine = this.buildKeywordQueryEngine();
      return;
    }

    const documents: Document[] = files.map((file) => {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
      return new Document({ text: content, metadata: { source: file } });
    });

    try {
      const index = await VectorStoreIndex.fromDocuments(documents);
      this.queryEngine = index.asQueryEngine();
    } catch {
      // fallback to keyword-based simple engine
      this.simpleDocs = files.map((file) => {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
        return { id: file, text: content, metadata: { source: file } };
      });
      this.queryEngine = this.buildKeywordQueryEngine();
    }
  }

  private buildKeywordQueryEngine(): QueryEngine {
    return {
      query: async ({ query }: { query: string }) => {
        if (!query || this.simpleDocs.length === 0) {
          return await Promise.resolve({ response: '' });
        }

        const qTokens = query.toLowerCase().split(/\W+/).filter(Boolean);
        const scores = this.simpleDocs.map((d) => {
          let score = 0;
          const text = d.text.toLowerCase();
          qTokens.forEach((t) => {
            let idx = text.indexOf(t);
            while (idx !== -1) {
              score++;
              idx = text.indexOf(t, idx + t.length);
            }
          });
          return { doc: d, score };
        });

        scores.sort((a, b) => b.score - a.score);
        const top = scores.filter((s) => s.score > 0).slice(0, 3);

        const response = top
          .map((s) => `Source: ${s.doc.id}\n${s.doc.text.slice(0, 800)}...`)
          .join('\n\n');

        return await Promise.resolve({ response });
      },
    };
  }

  // --- 4. Web context: use SerpAPI tool directly (simpler than bootstrapping an agent) ---
  private async getContextFromWeb(query: string): Promise<string> {
    if (!process.env.SERPAPI_API_KEY) return '';
    const searchTool = new SerpAPI(process.env.SERPAPI_API_KEY);
    try {
      // In v0.3 tools expose .invoke()
      const result = await searchTool.invoke({ q: query });
      if (!result) return '';
      if (typeof result === 'string') return result;
      // Normalize object -> string (safe fallback)
      return JSON.stringify(result).slice(0, 4000);
    } catch (err) {
      console.warn('SerpAPI search failed:', err);
      return '';
    }
  }

  // --- Generate blog (main flow) ---
  async generateBlog(topic: string): Promise<LiteBlog> {
    if (!this.draftRunnable || !this.seoRunnable) {
      throw new Error('Runnables not initialized');
    }

    // 1. Lấy context từ LlamaIndex hoặc fallback keyword
    let context = '';
    if (this.queryEngine) {
      const ctx = await this.queryEngine.query({ query: topic });
      context = ctx?.response ?? '';
    }

    // 2. Lấy thêm context từ web (SerpAPI tool)
    const webCtx = await this.getContextFromWeb(topic);
    if (webCtx) context += '\n' + webCtx;

    // 3. Draft blog
    const draftJson = await this.draftRunnable.invoke({ topic, context });

    // 4. SEO optimization
   const seoJson = await this.seoRunnable.invoke({ draft: JSON.stringify(draftJson) });

    // 6. Save to DB
    const blog = this.blogRepo.create(seoJson);
    return this.blogRepo.save(blog);
  }

  async getAllBlogs(): Promise<LiteBlog[]> {
    return this.blogRepo.find({ order: { createdAt: 'DESC' } });
  }

  // Optional: helper to demonstrate conversation usage with BufferMemory
  async chatWithMemory(sessionId: string, userInput: string) {
    if (!this.memory) throw new Error('Memory not initialized');

    const memVars = await this.memory.loadMemoryVariables({
      session_id: sessionId,
    });
    const chatHistory = memVars?.chat_history ?? '';

    const chatPrompt = ChatPromptTemplate.fromTemplate(`
You are a helpful assistant. Use the chat history and then answer the new user input.

Chat history:
{chat_history}

Human: {input}
AI:
`);

    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      apiKey: process.env.GEMINI_API_KEY ?? '',
    });

    const chatRunnable = chatPrompt.pipe(model);
    const resp = await chatRunnable.invoke({
      chat_history: chatHistory,
      input: userInput,
    });

    // Save the new exchange into memory
    await this.memory.saveContext(
      { input: userInput },
      { output: typeof resp === 'string' ? resp : JSON.stringify(resp) },
    );

    return resp;
  }
}

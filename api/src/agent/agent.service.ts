//docs.langchain.com/oss/javascript/langchain-quickstart

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { LiteBlog } from 'src/sqlite/lite-blog.entity';

import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { LLMChain, ConversationChain } from '@langchain/chains';
import { BufferMemory } from '@langchain/memory';
import { initializeAgentExecutor } from '@langchain/agents';
import { SerpAPI } from '@langchain/tools';

import { Document, VectorStoreIndex } from 'llamaindex';

type SimpleDoc = { id: string; text: string; metadata?: Record<string, any> };

@Injectable()
export class AgentService implements OnModuleInit {
  private draftChain: LLMChain | null = null;
  private seoChain: LLMChain | null = null;
  private conversation: ConversationChain | null = null;
  private queryEngine: any | null = null;
  private simpleDocs: SimpleDoc[] = [];

  constructor(
    @InjectRepository(LiteBlog, 'sqlite')
    private blogRepo: Repository<LiteBlog>,
  ) {}

  async onModuleInit() {
    await this.initLLMChains();
    await this.initMemory();
    await this.initLlama();
  }

  // --- 1. Prompt Templates + Chains ---
  private async initLLMChains() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY not set — Gemini model may not work.');
    }

    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      apiKey: process.env.GEMINI_API_KEY ?? '',
    });

    const draftPrompt = ChatPromptTemplate.fromTemplate(`
You are a professional Vietnamese content writer. Write a full Vietnamese blog post about: "{topic}".
Reference context: {context}
Output in JSON with keys: title, intro, items (subheading + paragraph)
`);

    const seoPrompt = ChatPromptTemplate.fromTemplate(`
Optimize this blog for SEO while keeping Vietnamese friendly tone.
Input draft JSON: {draft}
Return optimized JSON with same structure
`);

    const parser = new JsonOutputParser();

    this.draftChain = new LLMChain({
      llm: model,
      prompt: draftPrompt,
    });

    this.seoChain = new LLMChain({
      llm: model,
      prompt: seoPrompt,
    });

    this.chain = RunnableSequence.from([
      this.draftChain,
      this.seoChain,
      parser,
    ]);
  }

  // --- 2. Memory ---
  private async initMemory() {
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      apiKey: process.env.GEMINI_API_KEY ?? '',
    });

    const memory = new BufferMemory();

    this.conversation = new ConversationChain({
      llm: model,
      memory,
    });
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
      this.simpleDocs = files.map((file) => {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
        return { id: file, text: content, metadata: { source: file } };
      });
      this.queryEngine = this.buildKeywordQueryEngine();
    }
  }

  private buildKeywordQueryEngine() {
    return {
      query: async ({ query }: { query: string }) => {
        if (!query || this.simpleDocs.length === 0) return { response: '' };
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
        return { response };
      },
    };
  }

  // --- 4. Agent Tool example: search external web ---
  private async getContextFromWeb(query: string): Promise<string> {
    if (!process.env.SERPAPI_API_KEY) return '';
    const searchTool = new SerpAPI(process.env.SERPAPI_API_KEY);
    const executor = await initializeAgentExecutor(
      [searchTool],
      new ChatGoogleGenerativeAI({
        model: 'gemini-1.5-flash',
        apiKey: process.env.GEMINI_API_KEY ?? '',
      }),
      'zero-shot-react-description',
    );
    const result = await executor.call({ input: query });
    return result.output_text ?? '';
  }

  // --- Generate blog ---
  async generateBlog(topic: string): Promise<LiteBlog> {
    if (!this.draftChain || !this.seoChain)
      throw new Error('Chains not initialized');

    // 1. Lấy context từ LlamaIndex hoặc fallback keyword
    let context = '';
    if (this.queryEngine) {
      const ctx = await this.queryEngine.query({ query: topic });
      context = ctx?.response ?? '';
    }

    // 2. Lấy thêm context từ web (Tool/Agent)
    context += '\n' + (await this.getContextFromWeb(topic));

    // 3. Draft blog
    const draft = await this.draftChain.run({ topic, context });

    // 4. Optimize SEO
    const finalData = await this.seoChain.run({ draft });

    // 5. Parse JSON
    let blogJson;
    try {
      blogJson =
        typeof finalData === 'string' ? JSON.parse(finalData) : finalData;
    } catch {
      blogJson = { title: topic, intro: '', items: [] };
    }

    const blog = this.blogRepo.create(blogJson);
    return this.blogRepo.save(blog);
  }

  async getAllBlogs(): Promise<LiteBlog[]> {
    return this.blogRepo.find({ order: { createdAt: 'DESC' } });
  }
}

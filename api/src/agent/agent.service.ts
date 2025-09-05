// src/agent/agent.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import slugify from 'slugify';

// LangChain v0.3 imports
import { RunnableSequence, Runnable } from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { BufferMemory } from 'langchain/memory';
import { SerpAPI } from '@langchain/community/tools/serpapi';

// LlamaIndex
import { Document, VectorStoreIndex } from 'llamaindex';
import { LiteBlog } from 'src/sqlite/lite-blog.entity';
import { ImageService } from './image.service';

/* ----------------------------
   Schema & Parser (Zod)
   ---------------------------- */
const zodSchema = z.object({
  title: z.string(),
  intro: z.string(),
  items: z.array(
    z.object({
      subheading: z.string(),
      paragraph: z.string(),
    }),
  ),
});

export type BlogSchema = z.infer<typeof zodSchema>;
const blogParser = (StructuredOutputParser as any).fromZodSchema(
  zodSchema,
) as StructuredOutputParser<any>;

/* ----------------------------
   Helper types
   ---------------------------- */
type SimpleDoc = { id: string; text: string; metadata?: Record<string, any> };
interface QueryEngine {
  query: (args: { query: string }) => Promise<{ response: string }>;
}

/* ----------------------------
   Agent Service
   ---------------------------- */
@Injectable()
export class AgentService implements OnModuleInit {
  private draftRunnable: Runnable | null = null;
  private seoRunnable: Runnable | null = null;
  private markdownRunnable: Runnable | null = null;
  private memory: BufferMemory | null = null;
  private queryEngine: QueryEngine | null = null;
  private simpleDocs: SimpleDoc[] = [];

  constructor(
    @InjectRepository(LiteBlog, 'sqlite')
    private blogRepo: Repository<LiteBlog>,
    private imageService: ImageService,
  ) {}

  async onModuleInit() {
    this.initLLMRunnables();
    this.initMemory();
    this.initMarkdownChain();
    await this.initLlama();
  }

  /* ----------------------------
     Init LLM runnables
     ---------------------------- */
  private initLLMRunnables() {
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      apiKey: process.env.GEMINI_API_KEY ?? '',
      temperature: 0,
    });

    const draftPrompt = ChatPromptTemplate.fromTemplate(`
You are a professional Vietnamese content writer.
Write a full Vietnamese blog post about: "{topic}".
Reference context: {context}

{format_instructions}
`);

    const seoPrompt = ChatPromptTemplate.fromTemplate(`
Optimize this blog for SEO while keeping a friendly Vietnamese tone.
Input draft JSON: {draft}

{format_instructions}
Return optimized JSON with same structure.
`);

    this.draftRunnable = RunnableSequence.from([
      draftPrompt,
      model,
      blogParser,
    ]) as unknown as Runnable;
    this.seoRunnable = RunnableSequence.from([
      seoPrompt,
      model,
      blogParser,
    ]) as unknown as Runnable;
  }

  /* ----------------------------
     Memory
     ---------------------------- */
  private initMemory() {
    this.memory = new BufferMemory({ memoryKey: 'chat_history' });
  }

  /* ----------------------------
     LlamaIndex (local docs)
     ---------------------------- */
  private async initLlama() {
    const candidates = [
      path.resolve(process.cwd(), 'data'),
      path.resolve(process.cwd(), 'src', 'agent', 'data'),
    ];
    const dirPath = candidates.find(
      (p) => fs.existsSync(p) && fs.statSync(p).isDirectory(),
    );

    if (!dirPath) {
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

  private buildKeywordQueryEngine(): QueryEngine {
    return {
      query: ({ query }: { query: string }) => {
        if (!query || this.simpleDocs.length === 0) {
          return Promise.resolve({ response: '' });
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

        return Promise.resolve({ response });
      },
    };
  }

  /* ----------------------------
     Web context
     ---------------------------- */
  private async getContextFromWeb(query: string): Promise<string> {
    if (!process.env.SERPAPI_API_KEY) return '';
    const searchTool = new SerpAPI(process.env.SERPAPI_API_KEY);
    try {
      const result = await searchTool.invoke({ q: query });
      if (!result) return '';
      if (typeof result === 'string') return result;
      return JSON.stringify(result).slice(0, 4000);
    } catch {
      return '';
    }
  }

  /* ----------------------------
     Content Checker
     ---------------------------- */
  private runContentChecks(blog: BlogSchema) {
    if (blog.title.length > 70) {
      throw new Error('❌ Title dài quá 70 ký tự');
    }
    if (blog.intro.length < 50) {
      throw new Error('❌ Intro quá ngắn');
    }

    const sensitiveWords = ['cấm', 'nhạy cảm'];
    for (const word of sensitiveWords) {
      if (blog.intro.includes(word)) {
        throw new Error(`❌ Phát hiện từ nhạy cảm: ${word}`);
      }
    }

    const wordCount = blog.items
      .map((i) => i.paragraph.split(/\s+/).length)
      .reduce((a, b) => a + b, 0);
    const keywordCount = blog.items
      .map((i) => (i.paragraph.match(/AI/gi) || []).length)
      .reduce((a, b) => a + b, 0);
    const keywordDensity = wordCount ? keywordCount / wordCount : 0;

    return { keywordDensity };
  }

  /* ----------------------------
     Convert BlogSchema → Markdown
     ---------------------------- */
  private toMarkdown(blog: BlogSchema): string {
    let md = `# ${blog.title}\n\n`;
    md += `${blog.intro}\n\n`;
    blog.items.forEach((it) => {
      md += `## ${it.subheading}\n\n${it.paragraph}\n\n`;
    });
    return md.trim();
  }
  /* ----------------------------
     Generate Image
     ---------------------------- */
  private async generateBlogImage(
    parsed: BlogSchema,
    slug: string,
  ): Promise<string> {
    // Dịch tiêu đề và intro sang English (có thể tạm dùng template)
    // const titleEn = `Blog about: ${parsed.title}`;
    // const introEn = `Short description: ${parsed.intro}`;
    // const imagePrompt = `${titleEn}\n${introEn}`;

    const imagePrompt = 'Lighthouse on a cliff overlooking the ocean';

    try {
      return await this.imageService.generateImage(imagePrompt, `${slug}.webp`);
    } catch (err) {
      console.error('❌ Image generation failed:', err);
      // fallback image
      return `https://dummyimage.com/1200x630/000/fff&text=${encodeURIComponent(parsed.title)}`;
    }
  }

  private initMarkdownChain() {
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      apiKey: process.env.GEMINI_API_KEY ?? '',
      temperature: 0,
    });

    const mdPrompt = ChatPromptTemplate.fromTemplate(`
You are a professional Vietnamese content writer.
Improve the blog markdown to be more readable, visually appealing, and SEO friendly.

Input markdown content:
{markdown}

Return the improved markdown with headings, spacing, and highlighted sections for UI display.
`);

    this.markdownRunnable = RunnableSequence.from([
      mdPrompt,
      model,
    ]) as unknown as Runnable;
  }

  /* ----------------------------
     Generate blog
     ---------------------------- */
  async generateBlog(topic: string): Promise<LiteBlog> {
    if (!this.draftRunnable || !this.seoRunnable)
      throw new Error('Runnables not initialized');

    let context = '';
    if (this.queryEngine) {
      const ctx = await this.queryEngine.query({ query: topic });
      context = ctx?.response ?? '';
    }
    const webCtx = await this.getContextFromWeb(topic);
    if (webCtx) context += '\n' + webCtx;

    const formatInstructions = blogParser.getFormatInstructions?.() ?? '';

    // 1️⃣ Tạo draft
    const draftRaw = await this.draftRunnable.invoke({
      topic,
      context,
      format_instructions: formatInstructions,
    });

    // 2️⃣ SEO chain
    const draftForSeo =
      typeof draftRaw === 'string' ? draftRaw : JSON.stringify(draftRaw);
    const seoRaw = await this.seoRunnable.invoke({
      draft: draftForSeo,
      format_instructions: formatInstructions,
    });

    // 3️⃣ Parse SEO output
    const parsed: BlogSchema =
      typeof seoRaw === 'string'
        ? JSON.parse(seoRaw)
        : (seoRaw as unknown as BlogSchema);

    // ✅ Run ContentChecker
    const { keywordDensity } = this.runContentChecks(parsed);

    // ✅ Markdown + Slug + OG
    const markdown = this.toMarkdown(parsed);
    const enhancedMarkdown = this.markdownRunnable
      ? await this.markdownRunnable.invoke({ markdown })
      : markdown;
    let finalMarkdown: string;

    if (typeof enhancedMarkdown === 'string') {
      finalMarkdown = enhancedMarkdown;
    } else if (enhancedMarkdown?.kwargs?.content) {
      finalMarkdown = enhancedMarkdown.kwargs.content;
    } else {
      finalMarkdown = JSON.stringify(enhancedMarkdown, null, 2);
    }
    const slug = slugify(parsed.title, { lower: true, strict: true });

    // ✅ OG metadata
    const coverImagePath = await this.generateBlogImage(parsed, slug);
    const og = {
      image: coverImagePath,
      description: parsed.intro.slice(0, 150),
    };

    // 5️⃣ Lưu vào DB
    const entityData: Partial<LiteBlog> = {
      title: parsed.title,
      intro: parsed.intro,
      items: parsed.items.map((it) => ({
        title: it.subheading,
        description: it.paragraph,
      })),
      markdown: finalMarkdown,
      slug,
      og,
      metadata: {
        sourceType: webCtx ? 'web' : 'local',
        modelVersion: 'gemini-1.5-flash',
        pipelineVersion: 'seo-v1',
        keywordDensity,
      },
      coverImage: coverImagePath,
    };

    const blogEntity = this.blogRepo.create(entityData);
    return await this.blogRepo.save(blogEntity);
  }

  async getAllBlogs(): Promise<LiteBlog[]> {
    return this.blogRepo.find({ order: { createdAt: 'DESC' } });
  }

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

    const chatModel = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      apiKey: process.env.GEMINI_API_KEY ?? '',
    });

    const chatRunnable = chatPrompt.pipe(chatModel);
    const resp = await chatRunnable.invoke({
      chat_history: chatHistory,
      input: userInput,
    });

    await this.memory.saveContext(
      { input: userInput },
      { output: typeof resp === 'string' ? resp : JSON.stringify(resp) },
    );

    return resp;
  }
}

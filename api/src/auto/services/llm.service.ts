import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { CohereClient } from 'cohere-ai';
import { Settings } from 'llamaindex';

export class LLMService {
  public gemini: ChatGoogleGenerativeAI;
  public cohere: CohereClient;

  constructor() {
    this.gemini = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY!,
      model: 'gemini-2.0-flash-001',
      temperature: 0.2,
    });

    this.cohere = new CohereClient({
      token: process.env.COHERE_API_KEY!,
    });
  }

  /**
   * Gọi chat LLM với mảng messages
   * @param messages mảng string
   */
  async chat(messages: string[] = []) {
    // 1️⃣ Tạo prompt template
    const prompt = ChatPromptTemplate.fromTemplate(`
Bạn là trợ lý thông minh.
Người dùng nói: {user_input}
Hãy trả lời đầy đủ, rõ ràng và hữu ích.
    `);

    // 2️⃣ Chuỗi runnables theo chuẩn LangChain
    const chain = prompt
      .pipe(this.gemini) // output prompt -> input Gemini
      .pipe(new StringOutputParser()); // parse kết quả thành string

    // 3️⃣ Chạy chain
    return await chain.invoke({ user_input: messages.join('\n') });
  }

  /**
   * Lấy embedding text từ Cohere
   * @param text string
   * @returns number[]
   */
  // async embed(text: string): Promise<number[]> {
  //   const resp = await this.cohere.v2.embed({
  //     texts: [text],
  //     model: 'embed-v4.0',
  //     inputType: 'classification',
  //     embeddingTypes: ['float'],
  //   });

  //   const floats = (resp as any).embeddings?.float?.[0];
  //   if (!Array.isArray(floats)) throw new Error('Invalid embedding');
  //   return floats;
  // }
  async embed(text: string): Promise<number[]> {
    return Settings.embedModel.getTextEmbedding(text);
  }
}

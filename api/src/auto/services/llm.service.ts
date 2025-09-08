import { GoogleGenAI } from '@google/genai';
import { CohereClient } from 'cohere-ai';

export class LLMService {
  private gemini = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  private cohere = new CohereClient({
    token: process.env.COHERE_API_KEY!,
  });

  async chat(contents: string[] = []) {
    const response = await this.gemini.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents,
    });
    return response.text;
  }

  private isNumberArray(x: unknown): x is number[] {
    return Array.isArray(x) && x.every((v) => typeof v === 'number');
  }

  async embed(text: string): Promise<number[]> {
    const resp = await this.cohere.v2.embed({
      texts: [text],
      model: 'embed-v4.0',
      inputType: 'classification',
      embeddingTypes: ['float'],
    });

    const floats = (resp as unknown as { embeddings?: { float?: unknown } })
      .embeddings?.float;

    if (!Array.isArray(floats) || floats.length === 0) {
      throw new Error('No float embeddings returned from Cohere API');
    }

    const first = floats[0];

    if (!this.isNumberArray(first)) {
      throw new Error('Invalid embedding format returned from Cohere API');
    }

    return first;
  }
}

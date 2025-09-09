import { LLMService } from './llm.service';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ToolStep } from '../type/tool-step.type';

export class ReasoningService {
  private llm = new LLMService();

  async decomposeQuestion(q: string): Promise<ToolStep[]> {
    const prompt = ChatPromptTemplate.fromTemplate(
      `You are a smart assistant. Break down the user's question into sub-questions if needed.
For each sub-question, suggest the tool to use (search, ragSearch, checkStock, getPrice)
and provide the corresponding input. If the input comes from the result of the previous step, use "input_from_previous": true.

⚠️ IMPORTANT: ONLY return a single valid JSON array of arrays, no explanation. Example:

Here is an example of how you should respond:
[
  {{ "tool": "ragSearch", "input": "seafood pizza" }},
  {{ "tool": "getPrice", "input_from_previous": true }},
  {{ "tool": "checkStock", "input_from_previous": true }}
]

Now, answer the following question:
Question: {question}`,
    );
    const chain = RunnableSequence.from([
      prompt,
      this.llm.gemini,
      new StringOutputParser(),
    ]);

    const raw = await chain.invoke({ question: q });
    console.log('chain', raw);
    const cleaned = raw
      .replace(/```json/i, '')
      .replace(/```/g, '')
      .trim();
    try {
      const parsed: ToolStep[] = JSON.parse(cleaned);
      return parsed;
    } catch {
      console.error('Failed to parse JSON from LLM output:', cleaned);
      return [];
    }
  }
}

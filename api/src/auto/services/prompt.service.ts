// src/ai/prompt.service.ts
import { Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class PromptService {
  // Prompt: chia nhỏ câu hỏi
  splitQuestion() {
    return ChatPromptTemplate.fromTemplate(`You are a smart assistant. Break down the user's question into sub-questions if needed.
⚠️ IMPORTANT: ONLY return a JSON array of strings, no explanation.

Example:
[
  "Powder Canister có loại hải sản không?",
  "Giá của Powder Canister hải sản là bao nhiêu?",
  "Powder Canister hải sản còn hàng không?"
]

Now, answer the following question:
Question: {question}`);
  }

}

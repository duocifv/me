// src/ai/groq-formatter.service.ts
import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { ScheduleAIDataDto } from './dto/ai.dto';

@Injectable()
export class GroqService {
  private client: Groq;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new Error('⚠️ Thiếu GROQ_API_KEY trong biến môi trường!');
    }
    this.client = new Groq({ apiKey });
  }

  // async chatRaw(prompt: string): Promise<string> {
  //   try {
  //     const completion = await this.client.chat.completions.create({
  //       model: 'openai/gpt-oss-120b', // Hoặc model bạn muốn
  //       messages: [{ role: 'user', content: prompt }],
  //       temperature: 0.7,
  //     });

  //     return completion.choices[0]?.message?.content || '';
  //   } catch (err: any) {
  //     const msg = err?.response?.data ?? err?.message ?? err;
  //     throw new HttpException('Groq API Error: ' + JSON.stringify(msg), 500);
  //   }
  // }

  async chatJson(prompt: string) {
    const userFriendlyPrompt = `
You are a medical expert. The patient provides the following clinical symptoms: 
${prompt}

Please analyze and return a single JSON with the following keys, plain text (no Markdown, no •, no **):

1. "diagnosis": The main diagnosed disease (in Vietnamese).
2. "severity": Disease severity (mild / moderate / severe, in Vietnamese).
3. "confidence_percent": The % confidence of the main diagnosis.
4. "explanation": Detailed explanation of each symptom, causes, and severity (in Vietnamese).
5. "user_friendly_summary": A simple summary for the patient (in Vietnamese).
6. "management_advice": List of management advice, one line per item (in Vietnamese).
7. "red_flags": List of warning signs to watch, one line per item (in Vietnamese).
8. "confidence_level": Overall confidence, not absolute (in Vietnamese).

Requirements:
- Do not repeat content between fields.
- Return valid JSON, plain text, easy to parse.
- Each bullet point should be a separate line, no Markdown.

Example of the JSON response:
{
  "diagnosis": "Nhiễm trùng đường hô hấp trên",
  "severity": "Nhẹ",
  "confidence_percent": 85,
  "explanation": "...",
  "user_friendly_summary": "...",
  "management_advice": "...",
  "red_flags": "...",
  "confidence_level": "High (không tuyệt đối, nhưng rất cao)"
}
`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: userFriendlyPrompt }],
        temperature: 0,
      });

      const text = completion.choices[0]?.message?.content || '';
      return this.extractJson(text);
    } catch (err: any) {
      throw new HttpException('Groq API Error: ' + err.message, 500);
    }
  }

  private extractJson(text: string): ScheduleAIDataDto {
    const cleaned = text.replace(/```json|```/g, '').trim();
    try {
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      const jsonStr = cleaned.slice(start, end + 1);
      return JSON.parse(jsonStr) as ScheduleAIDataDto;
    } catch (err: any) {
      throw new Error('Không thể parse JSON: ' + err.message);
    }
  }
}

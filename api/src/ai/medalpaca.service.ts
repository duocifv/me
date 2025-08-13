import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { GeminiService } from './gemini-formatter.service';
import { OpenRouterAnalysisService } from './ai-analysis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { LiteMedical } from 'src/sqlite/lite-medical.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MedalpacaService {
  private readonly apiUrl = 'https://nvduocfpt-duoc2.hf.space/ask';
  constructor(
    private readonly geminiService: GeminiService,
    private readonly analysisService: OpenRouterAnalysisService,
    @InjectRepository(LiteMedical, 'sqlite')
    private readonly medicalRepo: Repository<LiteMedical>,
  ) {}

  async convertGeminiToPrompMedalpacat(analysisText: string) {
    const geminiPrompt = `
Medical expert. Extract only clinical symptoms (onset, duration, severity, triggers/relievers, associated symptoms) 
from the raw text. Output in compressed medical English, no questions, no history.
Raw: ${analysisText}
`.trim();
    const rewritten = await this.geminiService.chatWithGeminiRaw(geminiPrompt);

    if (
      !rewritten ||
      typeof rewritten !== 'string' ||
      rewritten.trim().length < 5
    ) {
      throw new InternalServerErrorException('Gemini output empty or invalid.');
    }

    const medAlpacaPrompt = `Clinical summary: ${rewritten}`;
    console.log('medAlpacaPrompt', medAlpacaPrompt);
    return medAlpacaPrompt;
  }

  async ask(text: string) {
    console.log('Gemini raw response:', text);
    if (!text) {
      throw new NotFoundException('Bạn phải gửi trường "text" trong body.');
    }

    const prompt = await this.convertGeminiToPrompMedalpacat(text);
    return prompt;
    // try {
    //   const response = await axios.post<{ output: string }>(this.apiUrl, {
    //     text: prompt,
    //   });
    //   if (response?.data) {
    //     const analysisResult = await this.analysisService.analyzeMedical(
    //       response?.data?.output,
    //     );
    //     await this.medicalRepo.save({
    //       analysisResult: JSON.stringify(analysisResult),
    //     });

    //     return analysisResult;
    //   }
    //   return null;
    // } catch {
    //   // Có thể log error chi tiết nếu muốn
    //   throw new NotFoundException('Lỗi khi gọi API AI bên ngoài');
    // }
  }
  async getAllAnalysisResults(): Promise<LiteMedical[]> {
    return this.medicalRepo.find({
      order: { createdAt: 'DESC' }, // tùy chọn sắp xếp mới nhất lên trước
    });
  }
}

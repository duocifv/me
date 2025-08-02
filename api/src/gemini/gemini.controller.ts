import { Controller, Get, Post } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Get()
  async getIrrigationSchedule() {
    return await this.geminiService.generateFinalSchedule();
  }

  @Post('apply')
  async applyGeminiSchedule() {
    const result = await this.geminiService.applyFinalSchedule();

    return {
      message: 'Updated all schedules from Gemini successfully.',
      updated: result,
    };
  }
}

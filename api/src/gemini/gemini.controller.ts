import { Controller, Get } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Get()
  async getIrrigationSchedule() {
    return await this.geminiService.generateFinalSchedule();
  }
}

import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UpdateAiRewardDto } from './dto/update-ai-log.dto';
import { AIService } from './ai.service';
import { ScheduleAIDataDto } from './dto/ai.dto';
import { MedalpacaService } from './medalpaca.service';
import { ApiBody } from '@nestjs/swagger';
import { string } from 'zod';
import { CreateMedalpacaDto } from './dto/create-medalpaca.dto';

@Controller('ai')
export class AIController {
  constructor(
    private readonly AIService: AIService,
    private readonly medalpacaService: MedalpacaService,
  ) {}

  @Get()
  async getIrrigationSchedule(): Promise<ScheduleAIDataDto> {
    const data = await this.AIService.generateFinalSchedule();
    if (!data) {
      throw new NotFoundException('Chưa có lịch nào được tạo');
    }
    return data;
  }

  @Post('apply')
  async applyAISchedule() {
    const result = await this.AIService.applyFinalSchedule();

    return {
      message: 'Updated all schedules from Gemini successfully.',
      updated: result,
    };
  }

  @Put(':id/reward')
  async setAiReward(@Param('id') id: string, @Body() body: UpdateAiRewardDto) {
    const ok = await this.AIService.updateAiLogReward(id, body.reward);
    if (!ok) throw new NotFoundException(`Không tìm thấy lịch AI với id ${id}`);
    return { message: 'Đã cập nhật đánh giá thành công ✅' };
  }

  @Get('logs')
  async getAllAiLogs() {
    return await this.AIService.getAllAiLogs();
  }

  @Post('medalpaca')
  @ApiBody({ type: CreateMedalpacaDto })
  async medAlpaca(@Body() body: CreateMedalpacaDto) {
    return this.medalpacaService.ask(body.text);
  }
}

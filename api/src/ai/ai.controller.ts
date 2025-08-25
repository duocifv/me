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
import { CreateMedalpacaDto } from './dto/create-medalpaca.dto';
import { HotelGeminiService } from './hotel-gemini.service';
import { Public } from 'src/shared/decorators/public.decorator';

@Controller('ai')
export class AIController {
  constructor(
    private readonly AIService: AIService,
    private readonly medalpacaService: MedalpacaService,
    private readonly hotelGeminiService: HotelGeminiService,
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

  @Public()
  @Post('hotel-chat')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example:
            'Xin chào, tôi muốn đặt phòng đôi cho 2 người cuối tuần này.',
        },
        chatHistory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string', example: 'user' },
              content: {
                type: 'string',
                example: 'Nếu 3 người thì có phòng nào?',
              },
            },
          },
          example: [
            { role: 'user', content: 'Nếu 3 người thì có phòng nào?' },
            {
              role: 'assistant',
              content: 'Dạ với 3 người có thể chọn Family Room.',
            },
          ],
        },
      },
    },
  })
  async hotelChat(
    @Body('message') message: string,
    @Body('chatHistory')
    chatHistory: { role: 'user' | 'assistant'; content: string }[],
  ) {
    const reply = await this.hotelGeminiService.chatHotel(message, chatHistory);

    return {
      success: true,
      reply,
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

  @Get('medalpaca')
  async getAllAnalysisResults() {
    const list = await this.medalpacaService.getAllAnalysisResults();
    return list.map((item) => ({
      id: item.id,
      analysisResult: JSON.parse(item.analysisResult),
      createdAt: item.createdAt,
    }));
  }
}

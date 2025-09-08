import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrchestratorService } from './services/orchestrator.service';
import { ChatQueryDto, ChatResponseDto } from './dto/auto.dto';

@ApiTags('chat')
@Controller('chat')
export class AutoController {
  constructor(private readonly orchestrator: OrchestratorService) {}

  @Get()
  @ApiOperation({ summary: 'Gửi câu hỏi cho AI Orchestrator' })
  @ApiQuery({
    name: 'q',
    description: 'Câu hỏi từ người dùng',
    example: 'Có pizza hải sản không? Giá bao nhiêu và còn hàng không?',
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả trả lời từ hệ thống AI',
    type: ChatResponseDto,
  })
  async chat(@Query() query: ChatQueryDto): Promise<ChatResponseDto | string> {
    return await this.orchestrator.handleUserQuery(query.q);
  }
}

import { Controller, Post, Body, Get } from '@nestjs/common';
import { AgentService } from './agent.service';
import { Public } from 'src/shared/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateBlogDto } from './dto/generate-blog.dto';

@ApiTags('Blogs')
@Controller('agent/blogs')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  /**
   * Sinh JSON blog từ topic
   */
  @Public()
  @Post()
  @ApiOperation({ summary: 'Tạo blog mới từ topic' })
  @ApiResponse({ status: 201, description: 'Blog đã được tạo thành công' })
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    const blog = await this.agentService.generateBlog(createBlogDto.topic);
    return { topic: createBlogDto.topic, blog };
  }

  /**
   * Lấy danh sách blog đã lưu trong SQLite
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách blogs đã tạo' })
  @ApiResponse({ status: 200, description: 'Danh sách blogs' })
  async getAllBlogs() {
    return this.agentService.getAllBlogs();
  }
}

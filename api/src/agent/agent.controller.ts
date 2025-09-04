import { Controller, Post, Body, Get } from '@nestjs/common';
import { AgentService } from './agent.service';
import { Public } from 'src/shared/decorators/public.decorator';

@Controller('agent')
export class AgentController {
    constructor(private readonly agentService: AgentService) { }

    /**
     * Sinh JSON blog từ topic
     */
    @Public()
    @Post('generate-json')
    async generateJSON(@Body('topic') topic: string) {
        const blog = await this.agentService.generateBlog(topic);
        return { topic, blog };
    }

    /**
     * Lấy danh sách blog đã lưu trong SQLite
     */
    @Public()
    @Get('blogs')
    async getAllBlogs() {
        return this.agentService.getAllBlogs();
    }

}

import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { LogsService } from './logs.service';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  getAll() {
    return this.logsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.logsService.findOne(+id);
  }

  @Post()
  create(@Body() body: { level: string; message: string; context?: string }) {
    return this.logsService.create(
      body.level as any,
      body.message,
      body.context,
    );
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.notificationService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.notificationService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() body: any) {
    return this.notificationService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.notificationService.remove(id);
  }
}

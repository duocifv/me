import { Controller, Post, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SendMessageDto } from '../dto/send-message.dto';
import { SendPhotoDto } from '../dto/send-photo.dto';
import { SendDocumentDto } from '../dto/send-document.dto';

@ApiTags('Telegram Bot')
@Controller('bots/telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('send-message')
  @ApiOperation({ summary: 'Gửi tin nhắn text đến Telegram' })
  async sendMessage(@Body() body: SendMessageDto) {
    return this.telegramService.sendMessage(body.text, body.parseMode);
  }

  @Post('send-photo')
  @ApiOperation({ summary: 'Gửi ảnh đến Telegram' })
  async sendPhoto(@Body() body: SendPhotoDto) {
    return this.telegramService.sendPhoto(body.photoUrl, body.caption);
  }

  @Post('send-document')
  @ApiOperation({ summary: 'Gửi file đến Telegram' })
  async sendDocument(@Body() body: SendDocumentDto) {
    return this.telegramService.sendDocument(body.fileUrl, body.caption);
  }
}

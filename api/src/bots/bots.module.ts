import { Module } from '@nestjs/common';
import { TelegramService } from './telegram/telegram.service';
import { TelegramController } from './telegram/telegram.controller';

@Module({
  providers: [TelegramService],
  exports: [TelegramService],
  controllers: [TelegramController],
})
export class BotsModule {}

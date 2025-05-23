import { Module } from '@nestjs/common';
import { MailService } from './v1/mail.service';
import { MailController } from './v1/mail.controller';

@Module({
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {}

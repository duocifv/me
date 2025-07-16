import { Module } from '@nestjs/common';
import { MailService } from './v1/mail.service';
import { MailController } from './v1/mail.controller';
import { MailerApiService } from './v1/mailer-api.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [MailService, MailerApiService],
  controllers: [MailController],
  exports: [MailService, MailerApiService],
})
export class MailModule {}

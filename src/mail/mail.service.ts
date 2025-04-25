import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  sendWelcome(to: string, context: any) {
    return this.mailer.sendMail({
      to,
      subject: 'Welcome!',
      template: 'welcome',
      context,
    });
  }
}

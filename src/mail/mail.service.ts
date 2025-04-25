import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendConfirmation(
    to: string,
    name: string,
    token: string,
  ): Promise<SentMessageInfo> {
    const confirmUrl = `${process.env.APP_URL}/auth/confirm?token=${token}`;
    const info = await this.mailer.sendMail({
      to,
      subject: 'Xác nhận đăng ký tài khoản MyApp',
      template: 'confirm',
      context: {
        name,
        confirmUrl,
      },
    });
    // const mailObject = JSON.parse(info.message);
    // console.log(mailObject.html);
    return info;
  }

  sendWelcome(
    to: string,
    context: {
      name: string;
      link: string;
    },
  ): Promise<SentMessageInfo> {
    return this.mailer.sendMail({
      to,
      subject: 'Welcome!',
      template: 'welcome',
      context,
    });
  }
}

import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailController } from './mail.controller';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: +process.env.SMTP_PORT!,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: { from: process.env.MAIL_FROM },
      template: {
        dir: __dirname + '/templates',
        adapter: new HandlebarsAdapter(), // hoặc PugAdapter/EjsAdapter
        options: { strict: true },
      },
    }),
  ],
  providers: [MailService],
  controllers: [MailController], // nếu có
})
export class MailModule {}

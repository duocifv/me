import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailController } from './mail.controller';
import { AppConfigService } from 'src/shared/config/config.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (cfg: AppConfigService) => cfg.mailerConfig,
    }),
  ],
  providers: [MailService],
  controllers: [MailController],
})
export class MailModule {}

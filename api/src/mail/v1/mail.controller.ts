import { Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { QuerySchema } from 'src/shared/decorators/query-schema.decorator';
import { MailDto, MailSchema } from '../dto/mail.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendMail(@QuerySchema(MailSchema) dto: MailDto) {
    const { to, subject } = dto;
    await this.mailService.sendCustom({ to, subject });
    return { message: 'Mail đã gửi thành công' };
  }

  @Post('register')
  async register(@QuerySchema(MailSchema) dto: MailDto) {
    await this.mailService.sendWelcomeEmail(dto.to, 'Welcome');
    return { message: 'Mail chào mừng đã gửi' };
  }

  @Post('forgot')
  async forgotPassword(@QuerySchema(MailSchema) dto: MailDto) {
    await this.mailService.sendResetPassword(dto.to, 'token');
    return { message: 'Mail đặt lại mật khẩu đã gửi' };
  }

  @Post('notify')
  async notify(@QuerySchema(MailSchema) dto: MailDto) {
    await this.mailService.sendNotification(dto.to, dto.subject, 'message');
    return { message: 'Mail thông báo đã gửi' };
  }
}

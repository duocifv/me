import {
  Controller,
  Get,
  Query,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { randomBytes } from 'crypto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test-confirm')
  @HttpCode(250)
  async testConfirm(
    @Query('email') email: string,
    @Query('name') name: string,
  ) {
    if (!email) {
      throw new BadRequestException('Thiếu email');
    }
    // tạo JWT hoặc lưu DB
    const token = randomBytes(16).toString('hex');

    const info = await this.mailService.sendConfirmation(
      email,
      name || 'bạn',
      token,
    );
    return {
      message: 'Đã gửi mail xác nhận đến ' + email,
      info,
    };
  }
}

import { Controller, Post, Res, Req } from '@nestjs/common';
import { MailService } from './mail.service';
import { FastifyReply, FastifyRequest } from 'fastify';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendMail(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const payload = req.getMail();
    // const info: SentMessageInfo = await this.mailService.sendTemplateMail(body);
    const sussecs = await res.sendMail(payload);
    return sussecs;
  }
}

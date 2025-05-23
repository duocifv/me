import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { FastifyInstance } from 'fastify';
import { existsSync } from 'fs';
import { SendMailOptions, SentMessageInfo } from 'nodemailer';
import path from 'path';
import pug from 'pug';

@Injectable()
export class MailService {
  private fastify: FastifyInstance;
  private templatePath: string;

  constructor(adapterHost: HttpAdapterHost) {
    this.fastify = adapterHost.httpAdapter.getInstance();
    this.templatePath = process.env.MAIL_TEMPLATE_PATH || 'templates/mail';
  }

  private renderTemplate(
    template: string,
    context: Record<string, any> = {},
  ): string {
    const filePath = path.join(this.templatePath, `${template}.pug`);
    if (!existsSync(filePath)) {
      throw new InternalServerErrorException(
        `Template "${template}" không tồn tại`,
      );
    }
    return pug.renderFile(filePath, context);
  }

  private async send(opts: SendMailOptions): Promise<SentMessageInfo> {
    try {
      return await this.fastify.mailer.sendMail(opts);
    } catch (err) {
      this.fastify.log.error('MailService.send error:', err);
      throw new InternalServerErrorException('Gửi mail thất bại');
    }
  }

  // 1. Gửi email xác nhận sau khi đăng ký
  async sendEmailVerification(
    to: string,
    token: string,
  ): Promise<SentMessageInfo> {
    const verifyLink = `https://duocnv.top/verify-email?token=${token}`;
    const html = this.renderTemplate('verify-email', { verifyLink });
    return this.send({
      to,
      subject: 'Xác nhận địa chỉ email của bạn',
      html,
    });
  }

  // 2. Gửi email chào mừng sau khi xác thực thành công
  async sendWelcomeEmail(to: string, name: string): Promise<SentMessageInfo> {
    const html = this.renderTemplate('welcome', { name });
    return this.send({
      to,
      subject: 'Chào mừng bạn đến với DuocNV!',
      html,
    });
  }

  // 3. Gửi yêu cầu đặt lại mật khẩu
  async sendResetPassword(to: string, token: string): Promise<SentMessageInfo> {
    const resetLink = `https://duocnv.top/reset-password?token=${token}`;
    const html = this.renderTemplate('reset-password', { resetLink });
    return this.send({
      to,
      subject: 'Yêu cầu đặt lại mật khẩu',
      html,
    });
  }

  // 4. Gửi thông báo tùy ý
  async sendNotification(
    to: string,
    title: string,
    message: string,
  ): Promise<SentMessageInfo> {
    const html = this.renderTemplate('notify', { message });
    return this.send({
      to,
      subject: title,
      html,
    });
  }

  // 5. Gửi email tùy chỉnh
  async sendCustom(
    opts: SendMailOptions & {
      template?: string;
      context?: Record<string, any>;
    },
  ): Promise<SentMessageInfo> {
    const { template, context, ...mailOpts } = opts;
    if (template) {
      mailOpts.html = this.renderTemplate(template, context);
    }
    return this.send(mailOpts);
  }
}

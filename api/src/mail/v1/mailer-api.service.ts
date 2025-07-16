// src/mail/mailer-api.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface MailersendResponse {
  message_id: string;
}

@Injectable()
export class MailerApiService {
  private readonly API_TOKEN = process.env.MAILERSEND_API_TOKEN;
  private readonly FROM =
    process.env.MAIL_FROM || 'Your Name <example@mlsender.net>';

  constructor(private readonly http: HttpService) {}

  async sendEmail({
    to,
    subject,
    text,
    html,
  }: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<MailersendResponse> {
    try {
      const res = await firstValueFrom(
        this.http.post<MailersendResponse>(
          'https://api.mailersend.com/v1/email',
          {
            from: {
              email: this.FROM.split('<')[1]?.replace('>', '').trim(),
              name: this.FROM.split('<')[0].trim(),
            },
            to: [{ email: to }],
            subject,
            text,
            html,
          },
          {
            headers: {
              Authorization: `Bearer ${this.API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return res.data; // ✅ đã có kiểu rõ ràng
    } catch (err) {
      console.error('Mailer API Error:', err?.response?.data || err);
      throw new InternalServerErrorException('MailerSend API: gửi thất bại');
    }
  }
}

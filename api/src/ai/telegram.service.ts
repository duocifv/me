// telegram.service.ts
import axios from 'axios';
import { TelegramResponse } from './type/telegram.types';
import { Injectable } from '@nestjs/common';

const TELEGRAM_API = 'https://api.telegram.org';
const BOT_TOKEN = '8468032350:AAH0IPyj07My9xebV96sGAf-WnWtlMp3zG0';
const CHAT_ID = '-4861203668';

if (!BOT_TOKEN || !CHAT_ID) {
  throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in env');
}

@Injectable()
export class TelegramService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${TELEGRAM_API}/bot${BOT_TOKEN}`;
  }

  /** Gửi tin nhắn text */
  async sendMessage(
    text: string,
    parseMode: 'Markdown' | 'HTML' | undefined = undefined,
  ): Promise<TelegramResponse> {
    try {
      const res = await axios.post<TelegramResponse>(
        `${this.baseUrl}/sendMessage`,
        {
          chat_id: CHAT_ID,
          text,
          parse_mode: parseMode,
        },
      );
      return res.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /** Gửi ảnh */
  async sendPhoto(
    photoUrl: string,
    caption?: string,
  ): Promise<TelegramResponse> {
    try {
      const res = await axios.post<TelegramResponse>(
        `${this.baseUrl}/sendPhoto`,
        {
          chat_id: CHAT_ID,
          photo: photoUrl,
          caption,
        },
      );
      return res.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /** Gửi file (log, báo cáo, pdf, txt...) */
  async sendDocument(
    fileUrl: string,
    caption?: string,
  ): Promise<TelegramResponse> {
    try {
      const res = await axios.post<TelegramResponse>(
        `${this.baseUrl}/sendDocument`,
        {
          chat_id: CHAT_ID,
          document: fileUrl,
          caption,
        },
      );
      return res.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /** Xử lý lỗi chung */
  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const e = error;
      console.error('Telegram API error:', e.response?.data || e.message);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
}

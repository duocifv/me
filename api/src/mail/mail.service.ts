import { Injectable } from '@nestjs/common';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class MailService {
  constructor() {}

  sendConfirmation(): SentMessageInfo {}
}

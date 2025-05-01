import { Injectable } from '@nestjs/common';

@Injectable()
export class ContactService {
  getContactPageData() {
    return {
      title: 'Contact Us',
      content: 'This is the contact page.',
    };
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class AboutService {
  getAboutPageData() {
    return {
      title: 'About Us',
      content: 'This is the about page.',
    };
  }
}

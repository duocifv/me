import { Injectable } from '@nestjs/common';

@Injectable()
export class HomeService {
  getHomePageData() {
    return {
      title: 'Home Page',
      content: 'Welcome to the home page!',
    };
  }
}

import { Controller, Get } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  getContactPage() {
    return this.contactService.getContactPageData();
  }
}

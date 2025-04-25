import { Injectable } from '@nestjs/common';
import { LoggingService } from './core/logging/logging.service';

@Injectable()
export class AppService {
  constructor(private readonly logger: LoggingService) {}
  getHello(): string {
    this.logger.log('Ping endpoint was called'); // info
    this.logger.debug('Debugging ping handler'); // debug
    return 'Hello World!';
  }
}

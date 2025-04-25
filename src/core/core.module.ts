import { Module, Global } from '@nestjs/common';
import { LoggingService } from './logging/logging.service';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './exception/exception.filter';

@Global()
@Module({
  providers: [LoggingService, ConfigService, GlobalExceptionFilter],
  exports: [LoggingService, ConfigService],
})
export class CoreModule {}

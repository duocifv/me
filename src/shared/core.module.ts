import { Module, Global } from '@nestjs/common';
import { LoggingService } from './logging/logging.service';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './exception/exception.filter';
import { AppConfigService } from './config/config.service';

@Global()
@Module({
  providers: [LoggingService, ConfigService, AppConfigService, GlobalExceptionFilter],
  exports: [LoggingService, ConfigService, AppConfigService],
})
export class CoreModule {}

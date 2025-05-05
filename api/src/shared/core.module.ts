import { Module, Global } from '@nestjs/common';
import { LoggingService } from './logging/logging.service';
import { ConfigService } from '@nestjs/config';
import { AppConfigService } from './config/config.service';
import { PaginationService } from './pagination/pagination.service';

@Global()
@Module({
  providers: [
    LoggingService,
    ConfigService,
    AppConfigService,
    PaginationService,
  ],
  exports: [LoggingService, ConfigService, AppConfigService, PaginationService],
})
export class CoreModule {}

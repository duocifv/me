import { Module, Global } from '@nestjs/common';
import { LoggingService } from './logging/logging.service';
import { ConfigService } from '@nestjs/config';
import { AppConfigService } from './config/config.service';

@Global()
@Module({
  providers: [LoggingService, ConfigService, AppConfigService],
  exports: [LoggingService, ConfigService, AppConfigService],
})
export class CoreModule {}

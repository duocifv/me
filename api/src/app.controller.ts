import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get Hello message' })
  getHello(): string {
    return this.appService.getHello();
  }

  // @Get('health')
  // @ApiOperation({ summary: 'Application health check' })
  // @HealthCheck()
  // async check(): Promise<HealthCheckResult> {
  //   const rootPath = path.parse(process.cwd()).root;
  //   return await this.health.check([
  //     async (): Promise<HealthIndicatorResult> =>
  //       await this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com', {
  //         timeout: 3000,
  //       }),

  //     async (): Promise<HealthIndicatorResult> =>
  //       await this.db.pingCheck('database', { timeout: 3000 }),

  //     async (): Promise<HealthIndicatorResult> =>
  //       await this.disk.checkStorage('disk', {
  //         path: rootPath,
  //         thresholdPercent: 0.9,
  //       }),

  //     async (): Promise<HealthIndicatorResult> =>
  //       await this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
  //   ]);
  // }
}

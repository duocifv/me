import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
  HealthCheck,
  HealthCheckResult,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import * as path from 'path';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get Hello message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Application health check' })
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    const rootPath = path.parse(process.cwd()).root;
    return await this.health.check([
      async (): Promise<HealthIndicatorResult> =>
        await this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com', {
          timeout: 3000,
        }),

      // 2. Kiểm tra kết nối database TypeORM
      async (): Promise<HealthIndicatorResult> =>
        await this.db.pingCheck('database', { timeout: 3000 }),

      // 3. Kiểm tra ổ đĩa (phải còn ít nhất 100MB trống)
      async (): Promise<HealthIndicatorResult> =>
        await this.disk.checkStorage('disk', {
          path: rootPath, // thư mục gốc của ứng dụng
          thresholdPercent: 0.9, // báo lỗi nếu dùng > 90% dung lượng
        }),

      // 4. Kiểm tra memory heap (phải < 150MB)
      async (): Promise<HealthIndicatorResult> =>
        await this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }
}

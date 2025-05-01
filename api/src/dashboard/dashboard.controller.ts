import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('reports')
  getReports() {
    return this.dashboardService.getReports();
  }
}

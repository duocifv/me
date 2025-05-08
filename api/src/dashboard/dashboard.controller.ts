import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Permissions } from 'src/permissions/permissions.decorator';
import { RolesAllowed } from 'src/roles/roles.decorator';
import { Roles } from 'src/roles/dto/role.enum';
import { PermissionName } from 'src/permissions/permission.enum';

@RolesAllowed(Roles.ADMIN, Roles.MANAGER)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /** Tổng quan (overview) */
  @Get()
  @Permissions(PermissionName.ACCESS_DASHBOARD)
  getOverview() {
    return this.dashboardService.getOverview();
  }

  /** Thống kê (stats) */
  @Get('stats')
  @Permissions(PermissionName.ACCESS_DASHBOARD, PermissionName.VIEW_STATS)
  getStats() {
    return this.dashboardService.getStats();
  }

  /** Báo cáo (reports) */
  @Get('reports')
  @Permissions(PermissionName.ACCESS_DASHBOARD, PermissionName.VIEW_REPORTS)
  getReports() {
    return this.dashboardService.getReports();
  }
}

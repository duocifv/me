import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  getOverview() {
    return { message: 'General dashboard overview' };
  }

  getStats() {
    return { users: 100, orders: 50, revenue: 10000 };
  }

  getReports() {
    return { reportDate: new Date(), data: [] };
  }
}

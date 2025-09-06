// dto/daily-update.dto.ts
export interface DailyUpdateDto {
  cmsName: string; // tên CMS (WordPress, Joomla, …)
  totalBookings: number; // tổng số booking
  revenue: number; // doanh thu
  occupancyRate: string; // tỷ lệ lấp đầy: "75%"
  date?: string; // optional: ngày update (default new Date() ở Apps Script)
}

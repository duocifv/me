// dto/booking.dto.ts
export interface BookingDto {
  name: string;
  phone: string;
  email: string;
  room: string; // "Loại phòng"
  checkin: string; // ISO date string: "2025-09-01"
  checkout: string; // ISO date string: "2025-09-03"
  guests: number; // Số lượng khách
  note?: string; // Ghi chú tùy chọn
  status?: string; // Tình trạng (default: "Chờ xác nhận")
}

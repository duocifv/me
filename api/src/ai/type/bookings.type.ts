// bookings.type.ts
export interface Booking {
  'Ngày đặt': string; // ISO date string
  'Họ và tên': string;
  'Số điện thoại': number;
  Email: string;
  'Check-in': string; // ISO date string
  'Check-out': string; // ISO date string
  'Loại phòng': string;
  'Ghi chú khách': string;
  'Tình trạng': string;
}

export interface BookingsResponse {
  success: boolean;
  type: 'bookings';
  data: Booking[];
}

// bookings.type.ts
export interface Booking {
  'Ngày đặt': string | null; // ISO date string
  'Họ và tên': string | null;
  'Số điện thoại': number | null;
  Email: string | null;
  'Check-in': string | null; // ISO date string
  'Check-out': string | null; // ISO date string
  'Loại phòng': string | null;
  'Ghi chú khách': string | null;
  'Tình trạng': string | null;
}

export interface BookingsResponse {
  success: boolean;
  type: 'bookings';
  data: Booking[];
}

export type ApiResponse = {
  success: boolean;
  data: BookingRecord[];
};

export type BookingRecord = {
  id: number | string;
  "Họ và tên": string | number;
  "Số điện thoại": string | number;
  "check-in": string;
  "check-out": string;
  "Số lượng khách": string;
  "loại phòng": string;
  created_at: string;
};

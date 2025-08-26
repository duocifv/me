export type ApiResponse = {
  success: boolean;
  data: BookingType[];
};

export interface BookingType {
  "Ngày đặt": string; // ISO datetime (vd: 2025-08-26T04:01:53.000Z)
  "Họ và tên": string;
  "Số điện thoại": string | number;
  Email: string;
  "Check-in": string; // ISO datetime
  "Check-out": string; // ISO datetime
  "Loại phòng": string;
  "Ghi chú khách"?: string; // optional
  "Tình trạng": "Chờ xác nhận" | "Đã xác nhận" | "Đã hủy" | string;
}

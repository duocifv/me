export type ApiResponse = {
  success: boolean;
  data: BookingType[];
};

export interface BookingType {
  "Ngày đặt": string; // ISO datetime (vd: 2025-08-27T05:05:42.269Z)
  "Họ và tên": string;
  "Số điện thoại": string | number;
  Email: string;
  "Check-in": string; // ISO datetime
  "Check-out": string; // ISO datetime hoặc ""
  "Loại phòng": string;
  "Số đêm": string | number | null;
  "Số khách": string | number | null;
  "Ghi chú khách": string;
  "Ý định đặt phòng": string;
  "Lý do nhận diện": string;
  "Điểm đánh giá": string | number;
  "Hành động khuyến nghị": string;
  "Tình trạng":
    | "pending"
    | "ok"
    | "Chờ xác nhận"
    | "Đã xác nhận"
    | "Đã hủy"
    | string;
}

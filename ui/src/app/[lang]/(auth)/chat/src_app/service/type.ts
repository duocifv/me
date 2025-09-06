export type ApiResponse = {
  success: boolean;
  data: RoomType[];
};

export interface RoomType {
  id: number;
  "Mã phòng": string;
  "Loại phòng": string;
  "Giá Phòng": string;
  "Mô tả": string;
  "Tiện ích": string;
  "Sức chứa": number;
  "Ghi chú": string;
  "Hình ảnh": string;
  Giá: string;
  Khuyến_mãi: string;
  Tình_trạng: string;
  Thực_đơn: string;
}

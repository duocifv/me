// room.type.ts
export interface Room {
  'Mã phòng': string;
  'Loại phòng': string;
  'Mô tả': string;
  'Tiện ích': string;
  'Sức chứa': number;
  'Ghi chú': string;
  'Hình ảnh': string;
}

export interface RoomsResponse {
  success: boolean;
  type: 'rooms';
  data: Room[];
}

export type RoomTypeResponse = {
  success: boolean;
  data: RoomType[];
};

export interface RoomType {
  id: number;
  'Mã phòng': string;
  'Loại phòng': string;
  'Giá Phòng': string;
  'Mô tả': string;
  'Tiện ích': string;
  'Sức chứa': number;
  'Ghi chú': string;
  'Hình ảnh': string;
  Giá: string;
  Khuyến_mãi: string;
  Tình_trạng: string;
  Thực_đơn: string;
}

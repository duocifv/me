// hotel.type.ts
export interface HotelInfo {
  'Tên khách sạn': string;
  'Địa chỉ': string;
  'Điện thoại': string;
  Email: string;
  'Giờ nhận phòng': string;
  'Giờ trả phòng': string;
}

export interface HotelResponse {
  success: boolean;
  type: 'hotel';
  data: HotelInfo;
}

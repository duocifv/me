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

export interface RoomInfo {
  id: string;
  type: string;
  beds: string;
  price: string;
}

export interface HotelData {
  name: string;
  address: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  description: string;
  rooms: RoomInfo[];
  policies: string[];
}

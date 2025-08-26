// service.type.ts
export interface Service {
  'Dịch vụ': string;
  'Mô tả': string;
  'Giờ phục vụ': string;
  'Ghi chú': string;
}

export interface ServicesResponse {
  success: boolean;
  type: 'services';
  data: Service[];
}

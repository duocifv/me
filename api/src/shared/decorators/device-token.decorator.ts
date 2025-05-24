import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

/**
 * Thêm header `x-device-token` vào tài liệu Swagger.
 *
 * Header này được sử dụng để xác định thiết bị (ví dụ: ESP32, thiết bị IoT).
 * Yêu cầu có trong các API dành riêng cho thiết bị để đảm bảo bảo mật.
 *
 * Máy chủ sẽ sử dụng giá trị này để xác minh danh tính thiết bị và đảm bảo chỉ thiết bị hợp lệ mới được phép truy cập.
 *
 * Ví dụ: `esp`
 */
export function DeviceToken() {
  return applyDecorators(
    ApiHeader({
      name: 'x-device-token',
      description: `Token xác thực đại diện cho thiết bị gửi dữ liệu (ví dụ: ESP32).
Dùng để xác minh tính hợp lệ của thiết bị.`,
      required: true,
      schema: {
        type: 'string',
        example: 'esp32',
      },
    }),
    ApiHeader({
      name: 'x-device-id',
      description: `ID duy nhất để nhận diện thiết bị trong hệ thống (ví dụ: MAC address, serial number...).`,
      required: true,
      schema: {
        type: 'string',
        example: 'device-001',
      },
    }),
  );
}

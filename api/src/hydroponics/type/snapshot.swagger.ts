import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

export const CreateSnapshotSwagger = {
  schema: {
    type: 'object',
    properties: {
      sensorData: {
        type: 'object',
        properties: {
          water_temperature: { type: 'number', example: 22.5 },
          ambient_temperature: { type: 'number', example: 24.0 },
          humidity: { type: 'number', example: 60 },
          // light_intensity: { type: 'number', example: 100 }, // nếu cần thì mở lại
        },
        description: 'Dữ liệu cảm biến',
        example: {
          water_temperature: 22.5,
          ambient_temperature: 24.0,
          humidity: 60,
        },
      },
      solutionData: {
        type: 'object',
        properties: {
          ph: { type: 'number', example: 6.5 },
          ec: { type: 'number', example: 1.2 },
          orp: { type: 'number', example: 300 },
        },
        description: 'Dữ liệu dung dịch',
        example: {
          ph: 6.5,
          ec: 1.2,
          orp: 300,
        },
      },
    },
    required: ['sensorData', 'solutionData'],
    example: {
      sensorData: {
        water_temperature: 22.5,
        ambient_temperature: 24.0,
        humidity: 60,
      },
      solutionData: {
        ph: 6.5,
        ec: 1.2,
        orp: 300,
      },
    },
  },
};

export function ApiCreateSnapshot() {
  return applyDecorators(
    ApiOperation({ summary: 'Tạo snapshot mới cho crop active' }),
    ApiResponse({
      status: 201,
      description: 'Tạo snapshot thành công',
      schema: { example: { success: true } },
    }),
    ApiResponse({ status: 400, description: 'Dữ liệu gửi lên không hợp lệ' }),
    ApiBody(CreateSnapshotSwagger),
  );
}

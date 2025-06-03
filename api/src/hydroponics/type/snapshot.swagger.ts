import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

export function ApiCreateSnapshot() {
  return applyDecorators(
    ApiOperation({ summary: 'Tạo snapshot mới cho crop active' }),
    ApiResponse({
      status: 201,
      description: 'Tạo snapshot thành công',
      schema: { example: { success: true } },
    }),
    ApiResponse({
      status: 400,
      description:
        'Dữ liệu gửi lên không hợp lệ (sai format hoặc thiếu trường)',
    }),
    ApiBody({
      description: 'Payload chứa dữ liệu cảm biến và dung dịch',
      required: true,
      schema: {
        type: 'object',
        properties: {
          sensorData: {
            type: 'object',
            properties: {
              waterTemp: { type: 'number', example: 22.5 },
              ambientTemp: { type: 'number', example: 24.0 },
              humidity: { type: 'number', example: 60 },
            },
            required: ['waterTemp', 'ambientTemp', 'humidity'],
          },
          solutionData: {
            type: 'object',
            properties: {
              ph: { type: 'number', example: 6.5 },
              ec: { type: 'number', example: 1.2 },
              orp: { type: 'number', example: 300 },
            },
            required: ['ph', 'ec', 'orp'],
          },
        },
        required: ['sensorData', 'solutionData'],
        example: {
          sensorData: {
            waterTemp: 22.5,
            ambientTemp: 24.0,
            humidity: 60,
          },
          solutionData: {
            ph: 6.5,
            ec: 1.2,
            orp: 300,
          },
        },
      },
    }),
  );
}

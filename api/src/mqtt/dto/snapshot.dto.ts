// src/mqtt/dto/snapshot.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SnapshotDto {
  @ApiProperty({ example: 24.5, description: 'Nhiệt độ nước (°C)' })
  waterTemp: number;

  @ApiProperty({ example: 30.1, description: 'Nhiệt độ môi trường (°C)' })
  envTemp: number;

  @ApiProperty({ example: 65, description: 'Độ ẩm môi trường (%)' })
  envHumidity: number;

  @ApiProperty({ example: 'esp32-001', description: 'ID của thiết bị gửi dữ liệu' })
  deviceId: string;

  @ApiProperty({ example: 1722057555555, description: 'Thời điểm đo (timestamp UNIX ms)' })
  timestamp: number;
}

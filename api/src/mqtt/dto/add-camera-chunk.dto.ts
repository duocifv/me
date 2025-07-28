// src/mqtt/dto/add-camera-chunk.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AddCameraChunkDto {
  @ApiProperty({ example: 1722123456789 })
  id: number; // ảnh ID (dùng millis())

  @ApiProperty({ example: 0 })
  index: number; // thứ tự đoạn

  @ApiProperty({ example: 6 })
  total: number; // tổng số đoạn

  @ApiProperty({ example: 'QUJDREVGR0g=' })
  data: string; // chuỗi base64 đoạn nhỏ
}

export interface ChunkCache {
  total: number;
  received: string[];
  receivedCount: number;
}

// src/mqtt/dto/add-camera-image.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AddImagesDto {
  @ApiProperty() snapshotId: number;
  @ApiProperty({ type: [Object] })
  images: Array<{ id: number; snapshotId: number; filePath: string; size: number }>;
}

// src/mqtt/dto/add-camera-image.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AddImagesDto {
  @ApiProperty() snapshotId: number;
  @ApiProperty({ type: [String] })
  images: string[];
}

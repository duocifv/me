// src/mqtt/dto/add-camera-image.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AddImagesDto {
  @ApiProperty() snapshotId: number;
  @ApiProperty({ type: [String] })
  images: string[];
}

export interface CameraData {
  id: string;
  url: string;
  createdAt: string;
}

export type CloudinaryResource = {
  public_id: string;
  format: string;
  secure_url: string;
  created_at: string;
};

export type CloudinaryApiResponse = {
  resources: CloudinaryResource[];
};

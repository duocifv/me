// src/mqtt/dto/create-snapshot.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateSnapshotDto {
  @ApiProperty() id: number;
  @ApiProperty() cropInstanceId: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() isActive: boolean;
  @ApiProperty() waterTemp: number;
  @ApiProperty() ambientTemp: number;
  @ApiProperty() humidity: number;
  @ApiProperty() ph: number;
  @ApiProperty() ec: number;
  @ApiProperty() orp: number;
  @ApiProperty({ type: [Object] })
  images: Array<{ id: number; snapshotId: number; filePath: string; size: number }>;
}
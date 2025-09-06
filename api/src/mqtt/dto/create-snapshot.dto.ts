// src/mqtt/dto/create-snapshot.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateSnapshotDto {
  @ApiProperty() waterTemp: number;
  @ApiProperty() airTemp: number;
  @ApiProperty() humidity: number;
}

// src/mqtt/dto/create-snapshot.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateSnapshotDto {
  @ApiProperty() waterTemperature: number;
  @ApiProperty() ambientTemperature: number;
  @ApiProperty() humidity: number;
}

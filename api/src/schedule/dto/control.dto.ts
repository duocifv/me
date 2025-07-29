import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ControlDto {
  @ApiProperty({ description: 'Bật/tắt bơm' })
  @IsBoolean()
  pumpOn: boolean;

  @ApiProperty({ description: 'Bật/tắt đèn LED' })
  @IsBoolean()
  ledOn: boolean;

  @ApiProperty({ description: 'Bật/tắt quạt' })
  @IsBoolean()
  fanOn: boolean;

  @ApiProperty({ description: 'Cho phép gửi dữ liệu cảm biến (sensor)' })
  @IsBoolean()
  sensor: boolean;

  @ApiProperty({ description: 'Cho phép gửi ảnh camera' })
  @IsBoolean()
  camera: boolean;
}

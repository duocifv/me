import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateControlDto {
  @ApiProperty({ description: 'Bật/tắt quạt tản nhiệt' })
  @IsBoolean()
  fanCool: boolean;

  @ApiProperty({ description: 'Bật/tắt quạt tản nhiệt' })
  @IsBoolean()
  fanVent: boolean;

  @ApiProperty({ description: 'Bật/tắt đèn LED' })
  @IsBoolean()
  led: boolean;

  @ApiProperty({ description: 'Bật/tắt bơm' })
  @IsBoolean()
  pump: boolean;

  @ApiProperty({ description: 'Cho phép gửi dữ liệu cảm biến (sensor)' })
  @IsBoolean()
  sensors: boolean;

  @ApiProperty({ description: 'Cho phép gửi ảnh camera' })
  @IsBoolean()
  camera: boolean;
}

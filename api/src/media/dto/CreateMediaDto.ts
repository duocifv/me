import { ApiProperty } from '@nestjs/swagger';

export class CreateMediaDto {
  @ApiProperty()
  mime: string;

  @ApiProperty()
  size: number;

  @ApiProperty({ type: Object })
  variants: Record<'thumbnail' | 'medium' | 'large', string>;
}

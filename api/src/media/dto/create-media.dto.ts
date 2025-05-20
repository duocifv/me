import { ApiProperty } from '@nestjs/swagger';

export class CreateMediaDto {
  @ApiProperty()
  mimetype: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  category?: string;

  @ApiProperty({ type: Object })
  variants: Record<'thumbnail' | 'medium' | 'large', string>;
}

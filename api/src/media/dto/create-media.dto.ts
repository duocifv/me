import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaCategory } from '../type/media-category.type';

export class CreateMediaDto {
  @ApiProperty()
  mimetype: string;

  @ApiProperty()
  size: number;

  @ApiPropertyOptional()
  category?: MediaCategory[];

  @ApiProperty({
    type: Object,
    description: 'Các phiên bản ảnh, ví dụ: original, thumbnail, medium, large',
    example: {
      original: '/uploads/esp32/1234-raw.jpg',
      thumbnail: '/uploads/thumbs/1234-thumb.jpg',
      medium: '/uploads/medium/1234-med.jpg',
      large: '/uploads/large/1234-large.jpg',
    },
  })
  variants: Partial<
    Record<'original' | 'thumbnail' | 'medium' | 'large', string>
  >;
}

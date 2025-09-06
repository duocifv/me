import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class SendPhotoDto {
  @ApiProperty({
    description: 'URL ảnh',
    example: 'https://example.com/image.png',
  })
  @IsString()
  @IsUrl()
  photoUrl: string;

  @ApiProperty({
    description: 'Chú thích ảnh',
    example: 'Ảnh test',
    required: false,
  })
  @IsOptional()
  @IsString()
  caption?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({
    description: 'Chủ đề của blog để AI sinh nội dung',
    example: 'Cách học lập trình hiệu quả năm 2025',
  })
  @IsString()
  @MinLength(3)
  topic: string;
}

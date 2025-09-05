import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'Nội dung tin nhắn',
    example: 'Hello từ NestJS!',
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Định dạng tin nhắn',
    example: 'Markdown',
    required: false,
  })
  @IsOptional()
  @IsIn(['Markdown', 'HTML'])
  parseMode?: 'Markdown' | 'HTML';
}

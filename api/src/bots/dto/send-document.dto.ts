import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class SendDocumentDto {
  @ApiProperty({
    description: 'URL file',
    example: 'https://example.com/file.pdf',
  })
  @IsString()
  @IsUrl()
  fileUrl: string;

  @ApiProperty({
    description: 'Chú thích file',
    example: 'File test',
    required: false,
  })
  @IsOptional()
  @IsString()
  caption?: string;
}

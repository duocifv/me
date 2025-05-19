import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Upload ảnh (PNG, JPEG, GIF), tối đa 5MB',
  })
  file: any;
}

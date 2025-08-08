// src/ai/dto/create-medalpaca.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedalpacaDto {
  @ApiProperty({
    description: 'Nội dung văn bản y khoa thô cần soạn lại',
    example: 'Bệnh nhân có triệu chứng nghẹt mũi, mức độ đau 3/10...',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}

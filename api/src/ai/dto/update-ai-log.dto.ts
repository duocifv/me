import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAiRewardDto {
  @ApiProperty({
    example: 8,
    description: 'Điểm đánh giá chất lượng lịch do AI tạo, từ -10 đến +10',
  })
  @IsInt()
  @Min(-10)
  @Max(10)
  reward: number;

  @ApiProperty({
    example: 'Cây phát triển tốt, thời gian pump hợp lý',
    description: 'Phản hồi chi tiết về lịch AI đã tạo (không bắt buộc)',
    required: false,
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}

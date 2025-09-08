import { ApiProperty } from '@nestjs/swagger';

export class ChatQueryDto {
  @ApiProperty({
    example: 'Có pizza hải sản không? Giá bao nhiêu và còn hàng không?',
    description: 'Câu hỏi người dùng gửi vào hệ thống AI',
  })
  q: string;
}

export class ChatStepDto {
  @ApiProperty({ example: 'Pizza hải sản có trong menu không?' })
  step: string;
}

export class ChatResultDto {
  @ApiProperty({ example: 180000 })
  price: number | null;

  @ApiProperty({ example: 5 })
  stock: number | null;

  @ApiProperty({
    example: [
      {
        rating: 5,
        comment: 'Great product!',
        date: '2025-04-30T09:41:02.053Z',
        reviewerName: 'Savannah Gomez',
        reviewerEmail: 'savannah.gomez@x.dummyjson.com',
      },
    ],
  })
  reviews:
    | {
        rating: number;
        comment: string;
        date: string;
        reviewerName: string;
        reviewerEmail: string;
      }[]
    | [];
}

export class ChatResponseDto {
  @ApiProperty({
    example: 'Có pizza hải sản không? Giá bao nhiêu và còn hàng không?',
  })
  query: string;

  @ApiProperty({
    type: [String],
    example: [
      'Pizza hải sản có trong menu không?',
      'Giá bao nhiêu?',
      'Còn hàng không?',
    ],
  })
  steps: string[];

  @ApiProperty({ type: [ChatResultDto] })
  result: ChatResultDto[];

  @ApiProperty({ example: 'Đáp án có độ tin cậy cao ✅' })
  evaluation: string;
}

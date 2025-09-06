import { IsNotEmpty, IsString } from 'class-validator';

export class ErrorDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}

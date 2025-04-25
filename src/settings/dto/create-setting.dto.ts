import { IsString } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  key: string;

  @IsString()
  value: string;
}

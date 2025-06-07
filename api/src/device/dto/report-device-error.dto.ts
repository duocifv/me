import {
  IsString,
  IsOptional,
  IsISO8601,
} from 'class-validator';

export class ReportDeviceErrorDto {
  @IsString()
  device_id: string;

  @IsString()
  device_token: string;

  @IsString()
  error_code: string;

  @IsString()
  error_message: string;

  @IsISO8601()
  @IsOptional()
  timestamp?: string;
}

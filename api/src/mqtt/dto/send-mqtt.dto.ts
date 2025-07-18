import { IsString } from 'class-validator';

export class SendMqttDto {
  @IsString()
  message: string;
}

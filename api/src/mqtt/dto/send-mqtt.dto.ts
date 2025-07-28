// src/mqtt/dto/send-mqtt.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SendMqttDto {
  @ApiProperty({ description: 'Topic MQTT', example: 'esp32/screen' })
  topic: string;

  @ApiProperty({
    description: 'Nội dung message',
    example: 'Turn on the screen',
  })
  message: string;
}

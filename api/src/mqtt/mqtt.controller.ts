// mqtt.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { MqttService } from './mqtt.service';
import { SendMqttDto } from './dto/send-mqtt.dto';

@ApiTags('MQTT')
@Controller('mqtt')
export class MQTTController {
  constructor(private readonly mqttService: MqttService) {}

  @Post('send')
  @ApiOperation({ summary: 'Gửi dữ liệu đến ESP32' })
  @ApiBody({ type: SendMqttDto })
  @ApiResponse({ status: 200, description: 'Đã gửi dữ liệu MQTT thành công' })
  sendToScreen(@Body() body: SendMqttDto) {
    const topic = 'esp32/screen';
    this.mqttService.publish(topic, body.message);
    return { status: 'ok', topic, sent: body.message };
  }
}

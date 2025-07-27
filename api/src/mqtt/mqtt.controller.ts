import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { MqttService } from './mqtt.service';
import { SendMqttDto } from './dto/send-mqtt.dto';
import { AddImagesDto } from './dto/add-camera-image.dto';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { UpdateScreenDto } from './dto/screen.dto';

@ApiTags('MQTT')
@Controller('mqtt')
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}

  @Post('send')
  @ApiOperation({ summary: 'Gửi message đến MQTT' })
  @ApiBody({ type: SendMqttDto })
  @ApiResponse({ status: 200, description: 'OK' })
  send(@Body() dto: SendMqttDto) {
    this.mqttService.publish(dto.topic, dto.message);
    return { status: 'ok', topic: dto.topic, sent: dto.message };
  }

  @Post('sensors')
  @ApiOperation({ summary: 'Thiết bị gửi sensor snapshots' })
  @ApiBody({ type: CreateSnapshotDto })
  sensorSnapshot(@Body() dto: CreateSnapshotDto) {
    this.mqttService['latestSensor'] = dto; // hoặc dùng setter nếu bạn muốn rõ ràng hơn
    return { status: 'received' };
  }

  @Post('camera')
  @ApiOperation({ summary: 'Thiết bị gửi camera images' })
  @ApiBody({ type: AddImagesDto })
  cameraImage(@Body() dto: AddImagesDto) {
    this.mqttService['latestCamera'] = dto;
    return { status: 'received' };
  }

  @Post('screen')
  @ApiOperation({ summary: 'Thiết bị gửi trạng thái screen (relay)' })
  @ApiBody({ type: UpdateScreenDto })
  screenState(@Body() dto: UpdateScreenDto) {
    this.mqttService['latestScreen'] = dto;
    this.mqttService.publish('esp32/screen', dto); // publish nếu cần
    return { status: 'received' };
  }

  @Get('cache/sensors')
  @ApiOperation({ summary: 'Lấy cache sensor snapshot' })
  getSensor() {
    return this.mqttService.getLatestSensor();
  }

  @Get('cache/camera')
  @ApiOperation({ summary: 'Lấy cache camera images' })
  getCamera() {
    return this.mqttService.getLatestCamera();
  }

  @Get('cache/screen')
  @ApiOperation({ summary: 'Lấy trạng thái screen từ cache' })
  getScreen() {
    return this.mqttService.getLatestScreen();
  }

  @Post('cache/clear/sensors')
  @ApiOperation({ summary: 'Xóa cache sensor' })
  clearSensor() {
    this.mqttService.clearLatestSensor();
    return { status: 'cleared sensor' };
  }

  @Post('cache/clear/camera')
  @ApiOperation({ summary: 'Xóa cache camera' })
  clearCamera() {
    this.mqttService.clearLatestCamera();
    return { status: 'cleared camera' };
  }

  @Post('cache/clear/screen')
  @ApiOperation({ summary: 'Xóa trạng thái screen' })
  clearScreen() {
    this.mqttService.clearLatestScreen();
    return { status: 'cleared screen' };
  }
}

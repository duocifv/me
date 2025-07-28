import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { MqttService } from './mqtt.service';
import { SendMqttDto } from './dto/send-mqtt.dto';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { AddCameraChunkDto } from './dto/add-camera-chunk.dto';
import { UpdateControlDto } from './dto/control.dto';

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

  @Post('control')
  @ApiOperation({ summary: 'Thiết bị gửi trạng thái control (relay)' })
  @ApiBody({ type: UpdateControlDto })
  controlState(@Body() dto: UpdateControlDto) {
    this.mqttService['latestControl'] = dto;
    const payload = JSON.stringify(dto);
    console.log('payload', payload);
    this.mqttService.publish('esp32/control', payload);
    return { status: 'received' };
  }

  @Get('control')
  @ApiOperation({ summary: 'Lấy trạng thái control từ cache' })
  getControl() {
    return this.mqttService.getLatestControl();
  }

  @Delete('control')
  @ApiOperation({ summary: 'Xóa trạng thái control' })
  clearControl() {
    this.mqttService.clearLatestControl();
    return { status: 'cleared control' };
  }

  @Post('sensors')
  @ApiOperation({ summary: 'Thiết bị gửi sensor snapshots' })
  @ApiBody({ type: CreateSnapshotDto })
  sensorSnapshot(@Body() dto: CreateSnapshotDto) {
    this.mqttService['latestSensor'] = dto;
    return { status: 'received' };
  }

  @Get('sensors')
  @ApiOperation({ summary: 'Lấy cache sensor snapshot' })
  getSensor() {
    return this.mqttService.getLatestSensor();
  }

  @Delete('sensors')
  @ApiOperation({ summary: 'Xóa cache sensor' })
  clearSensor() {
    this.mqttService.clearLatestSensor();
    return { status: 'cleared sensor' };
  }

  @Post('camera')
  @ApiOperation({ summary: 'Thiết bị gửi từng phần ảnh base64' })
  @ApiBody({ type: AddCameraChunkDto })
  handleCameraChunk(@Body() dto: AddCameraChunkDto) {
    return this.mqttService.handleImageChunk(dto);
  }

  @Get('camera')
  @ApiOperation({ summary: 'Lấy cache camera images' })
  getCamera() {
    const data = this.mqttService.getLatestCamera();
    console.log('📤 Client requested latest camera image:', data);
    return data;
  }

  @Delete('camera')
  @ApiOperation({ summary: 'Xóa cache camera' })
  clearCamera() {
    this.mqttService.clearLatestCamera();
    return { status: 'cleared camera' };
  }

  @Get('errors')
  @ApiOperation({ summary: 'Lấy lỗi gần nhất từ ESP32' })
  getError() {
    return this.mqttService.getLatestError();
  }

  @Delete('errors')
  @ApiOperation({ summary: 'Xóa lỗi đã lưu từ ESP32' })
  clearError() {
    this.mqttService.clearLatestError();
    return { status: 'cleared error' };
  }
}

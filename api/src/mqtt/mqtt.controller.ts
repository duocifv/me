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
  async controlState(@Body() dto: UpdateControlDto) {
    await this.mqttService.handleControlCommand(dto);
    return { status: 'received' };
  }

  @Get('control')
  @ApiOperation({ summary: 'Lấy trạng thái control từ cache' })
  async getControl() {
    return await this.mqttService.getLatestControl();
  }

  @Delete('control')
  @ApiOperation({ summary: 'Xóa trạng thái control' })
  async clearControl() {
    await this.mqttService.clearLatestControl();
    return { status: 'cleared' };
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
  async getSensor() {
    return await this.mqttService.getLatestSensor();
  }

  @Delete('sensors')
  @ApiOperation({ summary: 'Xóa cache sensor' })
  async clearSensor() {
    await this.mqttService.clearLatestSensor();
    return { status: 'cleared sensor' };
  }

  @Post('camera')
  @ApiOperation({ summary: 'Thiết bị gửi từng phần ảnh base64' })
  @ApiBody({ type: AddCameraChunkDto })
  async handleCameraChunk(@Body() dto: AddCameraChunkDto) {
    return await this.mqttService.handleImageChunk(dto);
  }

  @Get('camera')
  @ApiOperation({ summary: 'Lấy cache camera images' })
  async getCamera() {
    return await this.mqttService.getLatestCamera();
  }

  @Delete('camera')
  @ApiOperation({ summary: 'Xóa cache camera' })
  async clearCamera() {
    return await this.mqttService.clearLatestCamera();
  }

  @Get('errors')
  @ApiOperation({ summary: 'Lấy lỗi gần nhất từ ESP32' })
  async getError() {
    return await this.mqttService.getLatestError();
  }

  @Delete('errors')
  @ApiOperation({ summary: 'Xóa lỗi đã lưu từ ESP32' })
  async clearError() {
    return await this.mqttService.clearLatestError();
  }
}

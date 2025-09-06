import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { MqttService } from './mqtt.service';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { AddCameraChunkDto } from './dto/add-camera-chunk.dto';
import { UpdateControlDto } from './dto/control.dto';

@ApiTags('MQTT')
@Controller('mqtt')
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}

  @Post('control')
  @ApiOperation({ summary: 'Refresh control (relay)' })
  @ApiBody({ type: UpdateControlDto })
  controlState() {
    this.mqttService.updateControl();
    return { status: 'received' };
  }

  @Get('control')
  @ApiOperation({ summary: 'Lấy trạng thái control' })
  getControl() {
    return this.mqttService.findOneControl();
  }

  @Post('sensors')
  @ApiOperation({ summary: 'Thiết bị gửi sensor snapshots' })
  @ApiBody({ type: CreateSnapshotDto })
  sensorSnapshot(@Body() dto: CreateSnapshotDto) {
    return this.mqttService.createSensor(dto);
  }

  @Get('sensors')
  @ApiOperation({ summary: 'Lấy tất cả sensor snapshot' })
  async getSensor() {
    return await this.mqttService.findLastSensor();
  }

  @Get('sensors-list')
  @ApiOperation({ summary: 'Lấy tất cả sensor snapshot' })
  async getSensorList() {
    return await this.mqttService.findAllSensor();
  }

  @Delete('sensors')
  @ApiOperation({ summary: 'Xóa tất cả sensor' })
  async clearSensor() {
    await this.mqttService.deleteSensor();
    return { status: 'cleared sensor' };
  }

  @Post('camera')
  @ApiOperation({ summary: 'Thiết bị gửi từng phần ảnh base64' })
  @ApiBody({ type: AddCameraChunkDto })
  async handleCameraChunk(@Body() dto: AddCameraChunkDto) {
    return await this.mqttService.handleImageChunk(dto);
  }

  @Get('camera')
  @ApiOperation({ summary: 'Danh sách camera' })
  async getCamera() {
    return await this.mqttService.findAllCamera();
  }

  @Delete('camera')
  @ApiOperation({ summary: 'Xóa tắt cả camera' })
  async clearCamera() {
    return await this.mqttService.deleteCamera();
  }

  @Get('errors')
  @ApiOperation({ summary: 'Lấy tất cả lỗi từ ESP32' })
  async getError() {
    return await this.mqttService.findAllError();
  }

  @Delete('errors')
  @ApiOperation({ summary: 'Xóa tất lỗi từ ESP32' })
  async clearError() {
    return await this.mqttService.deleteError();
  }

}

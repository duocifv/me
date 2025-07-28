import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Query,
  NotFoundException,
  Put,
  Delete,
} from '@nestjs/common';
import { BodySchema } from 'src/shared/decorators/body-schema.decorator';
import { DeviceService } from '../device/v1/device.service';
import {
  DeviceScheduleDto,
  DeviceScheduleSchema,
} from './dto/device-schedule.dto';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UpdateDeviceConfigTask } from './update-device-config.task';

@ApiTags('Schedule')
@Controller('device')
export class ScheduleController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly cronTask: UpdateDeviceConfigTask,
  ) {}

  @Get('schedule')
  async getSchedules(@Req() req): Promise<DeviceScheduleDto[]> {
    return this.deviceService.getSchedules(req.deviceId);
  }

  @Post(':deviceId/schedule')
  @HttpCode(201)
  @ApiParam({
    name: 'deviceId',
    example: 'device-001',
  })
  async createSchedule(
    @Param('deviceId') deviceId: string,
    @BodySchema(DeviceScheduleSchema) dto: DeviceScheduleDto,
  ): Promise<{ success: true }> {
    await this.deviceService.saveSchedule(deviceId, dto);
    return { success: true };
  }

  @Get(':deviceId/schedule/:id')
  @ApiParam({
    name: 'deviceId',
    example: 'device-001',
  })
  async getSchedule(
    @Param('deviceId') deviceId: string,
    @Param('id') id: number,
  ): Promise<DeviceScheduleDto> {
    const result = await this.deviceService.getScheduleById(deviceId, id);
    if (!result) throw new NotFoundException('Schedule not found');
    return result;
  }

  @Put(':deviceId/schedule/:id')
  @ApiParam({
    name: 'deviceId',
    example: 'device-001',
  })
  async updateSchedule(
    @Param('deviceId') deviceId: string,
    @Param('id') id: number,
    @BodySchema(DeviceScheduleSchema) dto: DeviceScheduleDto,
  ): Promise<{ success: true }> {
    await this.deviceService.updateSchedule(deviceId, id, dto);
    return { success: true };
  }

  @Delete(':deviceId/schedule/:id')
  @ApiParam({
    name: 'deviceId',
    example: 'device-001',
  })
  @HttpCode(204)
  async deleteSchedule(
    @Param('deviceId') deviceId: string,
    @Param('id') id: number,
  ): Promise<void> {
    await this.deviceService.deleteSchedule(deviceId, id);
  }

  @Get('apply-schedule')
  async applyScheduleNow(@Query('id') id: string) {
    await this.deviceService.applyScheduleAndUpdateConfig(id);
    return { success: true };
  }

  @Get('cron-status')
  getCronStatus() {
    return {
      message: 'Cron is running',
      runCount: this.cronTask.getRunCount(),
    };
  }
}

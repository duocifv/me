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
import { DeviceService } from './device.service';
import {
  DeviceScheduleDto,
  DeviceScheduleSchema,
} from '../dto/device-schedule.dto';
import { UpdateDeviceConfigTask } from '../tasks/update-device-config.task';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Schedule')
@Controller('device')
export class DeviceScheduleController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly cronTask: UpdateDeviceConfigTask,
  ) {}

  @Post('schedule')
  @HttpCode(201)
  async createSchedule(
    @BodySchema(DeviceScheduleSchema) dto: DeviceScheduleDto,
    @Req() req,
  ): Promise<{ success: true }> {
    await this.deviceService.saveSchedule(req.deviceId, dto);
    return { success: true };
  }

  @Get('schedule')
  async getSchedules(@Req() req): Promise<DeviceScheduleDto[]> {
    return this.deviceService.getSchedules(req.deviceId);
  }

  @Get(':deviceId/schedule/:id')
  async getSchedule(
    @Param('deviceId') deviceId: string,
    @Param('id') id: number,
  ): Promise<DeviceScheduleDto> {
    const result = await this.deviceService.getScheduleById(deviceId, id);
    if (!result) throw new NotFoundException('Schedule not found');
    return result;
  }

  @Put(':deviceId/schedule/:id')
  async updateSchedule(
    @Param('deviceId') deviceId: string,
    @Param('id') id: number,
    @BodySchema(DeviceScheduleSchema) dto: DeviceScheduleDto,
  ): Promise<{ success: true }> {
    await this.deviceService.updateSchedule(deviceId, id, dto);
    return { success: true };
  }

  @Delete(':deviceId/schedule/:id')
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

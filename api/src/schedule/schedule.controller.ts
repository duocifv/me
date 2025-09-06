import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Delete,
  Patch,
} from '@nestjs/common';
import { BodySchema } from 'src/shared/decorators/body-schema.decorator';
import {
  DeviceScheduleDto,
  DeviceScheduleSchema,
  DeviceType,
} from './dto/device-schedule.dto';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { CronTaskSchedule } from './schedule.task';
import {
  UpdateScheduleDto,
  UpdateScheduleSchema,
} from './dto/update-schedule.dto';

@ApiTags('Schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly cronTask: CronTaskSchedule,
  ) {}

  @Get('health')
  @ApiParam({
    name: 'deviceId',
    example: 'device-001',
  })
  getHealth(@Param('deviceId') deviceId: string) {
    return this.scheduleService.getHealth(deviceId);
  }
  @Get()
  async getSchedules() {
    return await this.scheduleService.getSchedules();
  }

  @Post(':deviceId')
  @HttpCode(201)
  @ApiParam({
    name: 'deviceId',
    example: 'device-001',
  })
  async createSchedule(
    @Param('deviceId') deviceId: string,
    @BodySchema(DeviceScheduleSchema) dto: DeviceScheduleDto,
  ) {
    await this.scheduleService.saveSchedule(deviceId, dto);
    return { success: true };
  }

  @Get(':deviceId')
  @ApiParam({
    name: 'deviceId',
    example: 'device-001',
  })
  async getScheduleByDevice(
    @Param('deviceId') deviceId: string,
  ): Promise<DeviceScheduleDto[]> {
    return await this.scheduleService.getScheduleByDevice(deviceId);
  }

  @Get(':deviceId/:id')
  @ApiParam({
    name: 'deviceId',
    example: 'device-001',
  })
  async getScheduleById(
    @Param('deviceId') deviceId: string,
    @Param('id') id: number,
  ): Promise<DeviceScheduleDto> {
    return await this.scheduleService.getScheduleById(deviceId, id);
  }

  @Patch(':deviceId/:id')
  @ApiParam({
    name: 'deviceId',
    example: 'device-001',
  })
  async updateSchedule(
    @Param('deviceId') deviceId: string,
    @Param('id') id: number,
    @BodySchema(UpdateScheduleSchema) dto: UpdateScheduleDto,
  ) {
    await this.scheduleService.updateSchedule(deviceId, id, dto);
    return { success: true };
  }

  @Patch(':deviceId/device/:device')
  @ApiParam({
    name: 'deviceId',
    example: 'device-001',
  })
  async updateScheduleByDevice(
    @Param('deviceId') deviceId: string,
    @Param('device') device: DeviceType,
    @BodySchema(UpdateScheduleSchema) dto: UpdateScheduleDto,
  ) {
    await this.scheduleService.updateScheduleByDevice(deviceId, device, dto);
    return { success: true };
  }

  @Delete(':deviceId/:id')
  @ApiParam({
    name: 'deviceId',
    example: 'device-001',
  })
  @HttpCode(204)
  async deleteSchedule(
    @Param('deviceId') deviceId: string,
    @Param('id') id: number,
  ) {
    await this.scheduleService.deleteSchedule(deviceId, id);
  }

  @Get('latest-config')
  getLatestDeviceConfig() {
    return this.scheduleService.getLatestConfig();
  }

  @Get('apply-schedule')
  async applyScheduleNow(@Query('id') id: string) {
    await this.scheduleService.applyScheduleAndUpdateConfig(id);
    return { success: true };
  }

  // @Get('cron-status')
  // getCronStatus() {
  //   return {
  //     message: 'Cron is running',
  //     runCount: this.cronTask.getRunCount(),
  //   };
  // }
}

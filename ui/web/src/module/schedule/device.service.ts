// src/adapter/schedule/device-schedule.service.ts
import { api } from "../share/api/apiClient";
import { ValidationError } from "../share/api/zod-error";
import {
  DeviceScheduleDto,
  DeviceScheduleSchema,
} from "./dto/device-schedule.dto";

class DeviceScheduleService {
  private device = api.group("device");

  async getSchedules(): Promise<DeviceScheduleDto[]> {
    return this.device.get<DeviceScheduleDto[]>(`schedule`);
  }

  async getSchedule(id: number): Promise<DeviceScheduleDto> {
    return this.device.get<DeviceScheduleDto>(`schedule/${id}`);
  }

  async createSchedule(dto: DeviceScheduleDto): Promise<DeviceScheduleDto> {
    return this.device.post<DeviceScheduleDto>("device-001/schedule", dto);
  }

  async updateSchedule(
    id: number,
    dto: DeviceScheduleDto
  ): Promise<DeviceScheduleDto> {
    const { data, success, error } = DeviceScheduleSchema.safeParse(dto);
    if (!success) {
      throw new ValidationError(error);
    }
    return this.device.put<DeviceScheduleDto>(
      `device-001/schedule/${id}`,
      data
    );
  }

  async deleteSchedule(id: number): Promise<void> {
    return this.device.delete<void>(`device-001/schedule/${id}`);
  }
}

export const deviceScheduleService = new DeviceScheduleService();

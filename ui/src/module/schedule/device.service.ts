// src/adapter/schedule/device-schedule.service.ts
import { api } from "../share/api/apiClient";
import { ScheduleItemDto } from "./dto/device-schedule.dto";
import { ScheduleItem } from "./dto/schedule.type";
import { UpdateScheduleDto } from "./dto/update-schedule.type";

class DeviceScheduleService {
  private device = api.group("schedule");

  async getSchedules(): Promise<ScheduleItem[]> {
    return this.device.get<ScheduleItem[]>(`device-001`);
  }

  async getHealth(): Promise<{
    on: boolean;
  }> {
    return this.device.get<{
      on: boolean;
    }>(`health`);
  }

  async getSchedule(id: string): Promise<ScheduleItem> {
    return this.device.get<ScheduleItem>(`device-001/${id}`);
  }

  async createSchedule(dto: ScheduleItemDto): Promise<{ success: true }> {
    return this.device.post<{ success: true }>("device-001", dto);
  }

  async updateSchedule(
    id: number,
    dto: UpdateScheduleDto
  ): Promise<UpdateScheduleDto> {
    return this.device.patch<UpdateScheduleDto>(`device-001/${id}`, dto);
  }

  async deleteSchedule(id: number): Promise<void> {
    return this.device.delete<void>(`device-001/${id}`);
  }
}

export const deviceScheduleService = new DeviceScheduleService();

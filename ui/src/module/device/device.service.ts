import { api } from "../share/api/apiClient";
import { DeviceControlDto } from "./dto/device-control.dto";
import { DeviceGemini } from "./dto/device-gemini.dto";
import { ErrorsDto, LatestConfig } from "./dto/latest-config.type";
import { SensorSnapshot } from "./dto/sensor.type";

class DeviceConfigService {
  private device = api.group("");

  async getByConfig(): Promise<LatestConfig> {
    return this.device.get<LatestConfig>(`schedule/latest-config`);
  }

  async createByConfig(dto: DeviceControlDto): Promise<DeviceControlDto> {
    return this.device.post<DeviceControlDto>("config", dto);
  }

  async getError(): Promise<ErrorsDto[]> {
    return this.device.get<ErrorsDto[]>(`mqtt/errors`);
  }

  async getSensors(): Promise<SensorSnapshot> {
    return this.device.get<SensorSnapshot>(`mqtt/sensors`);
  }

  async getGemini(): Promise<DeviceGemini> {
    return this.device.get<DeviceGemini>(`gemini`);
  }
}

export const deviceConfigService = new DeviceConfigService();

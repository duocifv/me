import { api } from "../share/api/apiClient";
import { DeviceControlDto } from "./dto/device-control.dto";
import { LatestConfig, SensorMessage } from "./dto/latest-config.type";

class DeviceConfigService {
  private device = api.group("");


  async getByConfig(): Promise<LatestConfig> {
    return this.device.get<LatestConfig>(`schedule/latest-config`);
  }

  
  async createByConfig(dto: DeviceControlDto): Promise<DeviceControlDto> {
    return this.device.post<DeviceControlDto>("config", dto);
  }

  async getError(): Promise<SensorMessage> {
    return this.device.get<SensorMessage>(`mqtt/errors`);
  }
}

export const deviceConfigService = new DeviceConfigService();

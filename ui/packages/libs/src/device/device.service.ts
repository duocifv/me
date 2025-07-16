import { api } from "../share/api/apiClient";
import { CreateDeviceConfigDto } from "./dto/create-device-config.dto";
import { DeviceErrorEntity } from "./dto/report-device-error.dto";

class DeviceConfigService {
  private device = api.group("device");

  async getByConfig(deviceId = "device-001"): Promise<CreateDeviceConfigDto> {
    return this.device.get<CreateDeviceConfigDto>(`config/${deviceId}`);
  }

  async createByConfig(
    dto: CreateDeviceConfigDto
  ): Promise<CreateDeviceConfigDto> {
    return this.device.post<CreateDeviceConfigDto>("config", dto);
  }

  async getError(deviceId = "device-001"): Promise<DeviceErrorEntity[]> {
    return this.device.get<DeviceErrorEntity[]>(`error/${deviceId}`);
  }
}

export const deviceConfigService = new DeviceConfigService();

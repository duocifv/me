import { api } from "../share/api/apiClient";
import { PermissionDto } from "./dto/permission.dto";

class PermissionsService {
  private permissionsApi = api.group("permissions");

  async findAll(): Promise<PermissionDto[]> {
    return this.permissionsApi.get<PermissionDto[]>("");
  }
}

export const permissionsService = new PermissionsService();


import { UpdateRoleDto } from "./dto/update-role.dto";
import { RoleDto, RoleFullDto } from "./dto/roles.dto";
import { api, ApiClient } from "../share/api/apiClient";

export class RolesApi {
  constructor(
    private readonly api: ApiClient
  ) { }
  async getAll() {
    return await this.api.get<RoleFullDto[]>("roles");
  }

  async getById(id: string) {
    return await this.api.get<RoleDto>(`roles/${id}`);
  }

  async update(id: string, dto: UpdateRoleDto) {
    return await this.api.put<RoleDto>(`roles/${id}`, dto);
  }
}

export const rolesApi = new RolesApi(api);

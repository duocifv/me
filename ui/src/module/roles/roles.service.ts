import { RoleDto, RoleFullDto } from "./dto/roles.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { api } from "../share/api/apiClient";

class RoleService {
  private rolesApi = api.group("roles");

  async findAll(): Promise<RoleFullDto[]> {
    return this.rolesApi.get<RoleFullDto[]>("");
  }

  async findOne(id: string): Promise<RoleDto> {
    return this.rolesApi.get<RoleDto>(`${id}`);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<RoleDto> {
    return this.rolesApi.put<RoleDto>(`${id}`, dto);
  }
}

export const roleService = new RoleService();

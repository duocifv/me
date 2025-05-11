import { RoleDto, RoleFullDto } from "../roles/dto/roles.dto";
import { UpdateRoleDto } from "../roles/dto/update-role.dto";
import { api } from "../share/api/apiClient";

export async function getAllRoles(): Promise<RoleFullDto[]> {
  return api.get<RoleFullDto[]>("roles");
}

export async function getRoleById(id: string): Promise<RoleDto> {
  return api.get<RoleDto>(`roles/${id}`);
}

export async function updateRole(
  id: string,
  dto: UpdateRoleDto
): Promise<RoleDto> {
  return api.put<RoleDto>(`roles/${id}`, dto);
}

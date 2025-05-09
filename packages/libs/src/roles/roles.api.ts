// src/roles/roles.api.ts
import { $get, $put } from "../share/api/apiHelpers";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { RoleDto, RoleFullDto, RoleListSchema } from "./dto/roles.dto";

export class RolesApi {
  async getAll() {
    return await $get<RoleFullDto[]>("roles");
  }

  /** Lấy chi tiết một role theo ID */
  async getById(id: string) {
    return await $get<RoleDto>(`roles/${id}`);
  }

  /** Cập nhật một role */
  async update(id: string, dto: UpdateRoleDto) {
    return await $put<RoleDto>(`roles/${id}`, dto);
  }
}

export const rolesApi = new RolesApi();

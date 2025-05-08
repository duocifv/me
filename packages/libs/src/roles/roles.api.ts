// src/roles/roles.api.ts
import { $get, $post, $put, $del } from "../share/api/apiHelpers";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { RoleDto, RoleListDto, RoleListSchema } from "./dto/role.dto";

export class RolesApi {
  async getAll(query = {}) {
    const data = await $get<RoleListDto[]>("roles", query);
    return RoleListSchema.parse(data);
  }

  /** Lấy chi tiết một role theo ID */
  async getById(id: string) {
    return await $get<RoleDto>(`roles/${id}`);
  }

  /** Tạo mới một role */
  async create(payload: CreateRoleDto) {
    return await $post<RoleDto>("roles", payload);
  }

  /** Cập nhật một role */
  async update(id: string, dto: UpdateRoleDto) {
    return await $put<RoleDto>(`roles/${id}`, dto);
  }

  /** Xoá role */
  async remove(id: string) {
    return await $del<void>(`roles/${id}`);
  }
}

export const rolesApi = new RolesApi();

// src/permissions/permissions.api.ts
import { $get, $post, $put, $del } from "../share/api/apiHelpers";
import { PermissionDto, PermissionListSchema } from "./dto/permission.dto";

export class PermissionsApi {
  /** Lấy danh sách permissions */
  async getAll(query = {}) {
    // Nếu cần parse query: GetPermissionsSchema.parse(query)
    const data = await $get<IPermissionListResponse>("permissions", query);
    return IPermissionListResponseSchema.parse(data);
    // Nếu API trả về mảng PermissionDto[]:
    // const arr = await $get<PermissionDto[]>('permissions', query);
    // return PermissionListSchema.parse(arr);
  }

  /** Lấy chi tiết một permission theo ID */
  async getById(id: string) {
    return await $get<PermissionDto>(`permissions/${id}`);
  }

  /** Tạo mới một permission */
  async create(payload: CreatePermissionDto) {
    return await $post<PermissionDto>("permissions", payload);
  }

  /** Cập nhật một permission */
  async update(id: string, dto: UpdatePermissionDto) {
    return await $put<PermissionDto>(`permissions/${id}`, dto);
  }

  /** Xoá permission */
  async remove(id: string) {
    return await $del<void>(`permissions/${id}`);
  }
}

export const permissionsApi = new PermissionsApi();

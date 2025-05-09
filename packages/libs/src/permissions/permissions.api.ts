import { $get } from "../share/api/apiHelpers";
import {
  PermissionDto,
  PermissionListDto,
  PermissionListSchema,
} from "./dto/permission.dto";

export class PermissionsApi {
  async getAll() {
    const data = await $get<PermissionListDto>("permissions");
    return PermissionListSchema.parse(data);
  }

  async getById(id: string) {
    return await $get<PermissionDto>(`permissions/${id}`);
  }
}

export const permissionsApi = new PermissionsApi();

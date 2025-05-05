import { $get } from "../share/api/apiHelpers";
import { IPagination } from "../share/type/paginate";
import { GetUsersSchema } from "./dto/get-users.dto";
import { UserStatsDto } from "./dto/user-stats.dto";
import { UserListDto } from "./dto/user.dto";

export interface IUser extends IPagination {
  items: UserListDto;
  stats: UserStatsDto;
}

export class UsersApi {
  async getAll(query = {}) {
    const params = GetUsersSchema.parse(query);
    const { data } = await $get<IUser>("users", params);
    return data;
  }
}

export const usersApi = new UsersApi();

import { z } from "zod";
import { UserListSchema } from "./user.dto";
import { UserStatsSchema } from "./user-stats.dto";
import { PaginationMetaSchema } from "../../share/schema/paginate";

export const IUserListResponseSchema = z.object({
  items: UserListSchema.default([]),
  meta: PaginationMetaSchema.default({}),
  stats: UserStatsSchema.default({}),
});

export type IUserListResponse = z.infer<typeof IUserListResponseSchema>;

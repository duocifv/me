import { z } from "zod";
import { UserStatus } from "./user-status.enum";
import { Roles } from "../../roles/dto/roles.enum";
import {
  zPreprocessArray,
  zPreprocessBoolean,
} from "../../share/utils/zod-utils";

export const UserSearhcSchema = z
  .string()
  .trim()
  .min(1, { message: "Search term quá ngắn" })
  .max(100, { message: "Search term quá dài" })
  .regex(/^[\w @._-]+$/, { message: "Chứa ký tự không hợp lệ" })
  .optional();

export const BasePaginateSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  search: UserSearhcSchema,
});

export const GetUsersSchema = BasePaginateSchema.extend({
  status: zPreprocessArray(z.nativeEnum(UserStatus)).optional(),
  roles: zPreprocessArray(z.nativeEnum(Roles)).optional(),
  isActive: zPreprocessBoolean.optional(),
  isPaid: zPreprocessBoolean.optional(),
});

export type GetUsersDto = z.infer<typeof GetUsersSchema>;

export const UserInputSearhcSchema = z.object({
  search: UserSearhcSchema,
});
export type UserInputSearchDto = z.infer<typeof UserInputSearhcSchema>;

import { z } from 'zod';
import { UserStatus } from './user-status.enum';
import { Roles } from 'src/roles/dto/role.enum';
import {
  zPreprocessArray,
  zPreprocessBoolean,
} from 'src/shared/filters/zod-utils';

export const UserSearhcSchema = z
  .string()
  .trim()
  .min(1, { message: 'Search term quá ngắn' })
  .max(100, { message: 'Search term quá dài' })
  .regex(/^[\w @._-]+$/, { message: 'Chứa ký tự không hợp lệ' })
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

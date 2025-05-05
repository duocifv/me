import { z } from 'zod';

export const UserStatsSchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  activeUsers: z.number().int().nonnegative(),
  newUsers: z.number().int().nonnegative(),
  conversionRate: z.number().min(0).max(100),
});
export type UserStatsDto = z.infer<typeof UserStatsSchema>;

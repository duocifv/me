import { z } from 'zod';

export const UserStatsSchema = z.object({
  totalUsers: z.number().int().nonnegative().default(0),
  activeUsers: z.number().int().nonnegative().default(0),
  newUsers: z.number().int().nonnegative().default(0),
  conversionRate: z.number().min(0).max(100).default(0),
});

export type UserStatsDto = z.infer<typeof UserStatsSchema>;

import { z } from 'zod';

export const createNotificationSchema = z.object({
  title: z.string(),
  message: z.string(),
  read: z.boolean().optional(),
});

export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;

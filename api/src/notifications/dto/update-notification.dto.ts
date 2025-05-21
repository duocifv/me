import { z } from 'zod';
import { createNotificationSchema } from './create-notification.dto';

export const updateNotificationSchema = createNotificationSchema.partial();
export type UpdateNotificationDto = z.infer<typeof updateNotificationSchema>;

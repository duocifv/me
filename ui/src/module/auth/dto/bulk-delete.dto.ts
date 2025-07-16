// dto/bulk-delete.schema.ts
import { z } from 'zod';

export const BulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'Phải có ít nhất 1 ID'),
});

export type BulkDeleteDto = z.infer<typeof BulkDeleteSchema>;

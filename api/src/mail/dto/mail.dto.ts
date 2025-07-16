import { z } from 'zod';

export const MailSchema = z.object({
  to: z.string().email({ message: 'Địa chỉ email không hợp lệ' }),
  subject: z.string().min(1, { message: 'Chủ đề là bắt buộc' }),
  template: z.string().optional(),
  context: z.record(z.any()).optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        content: z.any(),
        contentType: z.string().optional(),
        path: z.string().optional(),
      }),
    )
    .optional(),
});

export type MailDto = z.infer<typeof MailSchema>;

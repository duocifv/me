// src/news/dto/paginate-news.schema.ts
import { z } from 'zod';

export const PaginateNewsSchema = z.object({
    page: z.coerce
        .number({ required_error: 'page is required', invalid_type_error: 'page must be a number' })
        .int({ message: 'page must be an integer' })
        .min(1, { message: 'page must be at least 1' })
        .default(1),
    limit: z.coerce
        .number({ required_error: 'limit is required', invalid_type_error: 'limit must be a number' })
        .int({ message: 'limit must be an integer' })
        .min(1, { message: 'limit must be at least 1' })
        .default(10),
    search: z.string().optional(),
    published: z.coerce
        .boolean({ invalid_type_error: 'published must be a boolean' })
        .optional(),
});

export type PaginateNewsDto = z.infer<typeof PaginateNewsSchema>

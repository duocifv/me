import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { ZodTypeAny, z } from 'zod';

/**
 * Decorator để xác thực body bằng Zod schema.
 *
 * @param schema - Zod schema được sử dụng để xác thực dữ liệu.
 * @returns Tham số đã được xác thực và phân tích cú pháp.
 */
export function ValidatedBody<T extends ZodTypeAny>(schema: T) {
  type Inferred = z.infer<T>; // Sử dụng z.infer để tự động suy luận kiểu dữ liệu từ schema

  return createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): Inferred => {
      const request = ctx.switchToHttp().getRequest();
      const result = schema.safeParse(request.body); // Sử dụng safeParse của Zod để xác thực body

      if (!result.success) {
        const errors = result.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        throw new BadRequestException({
          message: 'Validation failed',
          errors,
          statusCode: 400,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result.data as Inferred; // Trả về dữ liệu đã xác thực và phân tích cú pháp
    },
  ) as ParameterDecorator; // Đảm bảo trả về kiểu ParameterDecorator hợp lệ
}

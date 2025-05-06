import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodTypeAny } from 'zod';

@Injectable()
export class ZodDtoPipe<T extends ZodTypeAny> implements PipeTransform {
  constructor(private schema: T) {}

  transform(value: unknown) {
    // Bỏ qua validation nếu không phải object (ví dụ path param là string)
    if (typeof value !== 'object' || value === null) {
      return value;
    }

    const result = this.schema.safeParse(value);
    if (!result.success) {
      const formatted = result.error.errors.map((e) => ({
        field: e.path.join('.') || 'body',
        message: e.message,
      }));
      throw new BadRequestException({
        message: 'Validation failed',
        errors: formatted,
        statusCode: 400,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.data;
  }
}

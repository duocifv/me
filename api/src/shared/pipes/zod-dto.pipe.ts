import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodTypeAny } from 'zod';

@Injectable()
export class ZodDtoPipe<T extends ZodTypeAny> implements PipeTransform {
  constructor(private schema: T) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const formatted = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw new BadRequestException({
        message: 'Validation failed',
        errors: formatted,
        statusCode: 400,
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result?.data;
  }
}

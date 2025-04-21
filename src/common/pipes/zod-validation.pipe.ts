import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: any) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      throw new BadRequestException({
        statusCode: 400, // Mã trạng thái HTTP
        message: 'Validation failed',
        errors,
      });
    }
    return result.data;
  }
}

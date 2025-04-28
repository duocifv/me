// src/common/filters/all-exceptions.filter.ts
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    // Ví dụ: ghi log
    console.error('Unhandled exception:', exception);

    // Gọi về BaseExceptionFilter để giữ hành vi mặc định của NestJS
    super.catch(exception, host); // :contentReference[oaicite:7]{index=7}
  }
}

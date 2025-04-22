// src/common/interceptors/fastify-multipart.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { MultipartFile, MultipartStream } from '@fastify/multipart';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class FastifyMultipartInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    if (!req.isMultipart) return next.handle();

    const parts: Record<string, any> = {};
    for await (const part of req.multipart()) {
      if (part.file) {
        const buffer = await (part as MultipartFile).toBuffer();
        parts[part.fieldname] = {
          buffer,
          filename: part.filename,
          mimetype: part.mimetype,
          size: buffer.byteLength,
        };
      } else {
        parts[part.fieldname] = await (
          part as MultipartStream
        ).value.toString();
      }
    }

    req.body = { ...req.body, ...parts };
    return next.handle();
  }
}

import { applyDecorators, UsePipes } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { ZodDtoPipe } from '../pipes/zod-dto.pipe';
import { ZodTypeAny } from 'zod';

export function ZodBody444<T extends ZodTypeAny>(schema: T) {
  return applyDecorators(
    UsePipes(new ZodDtoPipe(schema)),
    Body(), // không cần truyền schema vào Body
  );
}

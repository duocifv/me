import { applyDecorators, UsePipes } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { ZodDtoPipe } from '../pipes/zod-dto.pipe';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export function BodyDto<T extends z.ZodTypeAny>(schema: T) {
  const { definitions, ...rootSchema } = zodToJsonSchema(schema, {
    name: 'Dto',
  });
  const schemaDef = definitions?.Dto ?? rootSchema;

  return applyDecorators(
    UsePipes(new ZodDtoPipe(schema)),
    ApiBody({ schema: schemaDef as any }),
  );
}

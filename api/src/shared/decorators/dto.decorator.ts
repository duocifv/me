import { applyDecorators, UsePipes } from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { ZodDtoPipe } from '../pipes/zod-dto.pipe';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

type SchemaType = 'body' | 'query';

export function Schema<T extends z.ZodTypeAny>(
  schema: T,
  schemaType: SchemaType = 'body',
) {
  const { definitions, ...rootSchema } = zodToJsonSchema(schema, {
    name: 'Dto',
  });
  const schemaDef = definitions?.Dto ?? rootSchema;

  if (schemaType === 'query') {
    const properties = (schemaDef as any).properties as Record<string, any>;
    const requiredProps = (schemaDef as any).required ?? [];
    const decorators = [UsePipes(new ZodDtoPipe(schema))];

    for (const [param, propSchema] of Object.entries(properties)) {
      const isArray = propSchema.type === 'array';
      decorators.push(
        ApiQuery({
          name: param,
          required: requiredProps.includes(param),
          style: isArray ? 'form' : undefined,
          explode: isArray ? true : undefined,
          schema: propSchema,
        }),
      );
    }

    return applyDecorators(...decorators);
  }

  return applyDecorators(
    UsePipes(new ZodDtoPipe(schema)),
    ApiBody({ schema: schemaDef as any }),
  );
}

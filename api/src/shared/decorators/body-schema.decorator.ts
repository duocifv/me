import { Body } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ZodDtoPipe } from '../pipes/zod-dto.pipe';
import { ZodTypeAny } from 'zod';

export function BodySchema<T extends ZodTypeAny>(
  schema: T,
): ParameterDecorator {
  const pipe = new ZodDtoPipe(schema);
  const { definitions, ...rootSchema } = zodToJsonSchema(schema, {
    name: 'Dto',
  });
  const schemaDef = definitions?.Dto ?? rootSchema;

  return (target, propertyKey, parameterIndex) => {
    if (typeof propertyKey === 'undefined') {
      throw new Error(
        'ZodBody: propertyKey is undefined — cannot apply ApiBody.',
      );
    }

    ApiBody({ schema: schemaDef as any })(
      target.constructor,
      propertyKey,
      Object.getOwnPropertyDescriptor(
        target.constructor.prototype,
        propertyKey,
      )!,
    );

    Body(pipe)(target, propertyKey, parameterIndex);
  };
}

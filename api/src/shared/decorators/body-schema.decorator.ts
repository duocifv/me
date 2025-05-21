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

  return (
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    if (typeof propertyKey === 'undefined') {
      throw new Error(
        'BodySchema: propertyKey is undefined — cannot apply ApiBody.',
      );
    }

    const descriptor =
      Object.getOwnPropertyDescriptor(target, propertyKey) ??
      Object.getOwnPropertyDescriptor(
        target.constructor.prototype,
        propertyKey,
      );

    if (!descriptor) {
      console.warn(
        `BodySchema: Unable to find descriptor for ${String(propertyKey)}. Swagger schema may not apply correctly.`,
      );
    }

    // Swagger schema definition
    ApiBody({ schema: schemaDef as any })(
      target.constructor,
      propertyKey,
      descriptor ?? {},
    );

    // Apply Zod validation pipe
    Body(pipe)(target, propertyKey, parameterIndex);
  };
}

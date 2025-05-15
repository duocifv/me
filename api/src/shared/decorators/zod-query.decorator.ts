import { Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ZodDtoPipe } from '../pipes/zod-dto.pipe';
import { ZodTypeAny } from 'zod';

export function ZodQuery<T extends ZodTypeAny>(schema: T): ParameterDecorator {
  const pipe = new ZodDtoPipe(schema);
  const { definitions, ...rootSchema } = zodToJsonSchema(schema, {
    name: 'Dto',
  });
  const schemaDef = definitions?.Dto ?? rootSchema;

  return (target, propertyKey, parameterIndex) => {
    if (typeof propertyKey === 'undefined') {
      throw new Error(
        'ZodQuery: propertyKey is undefined — cannot apply ApiQuery.',
      );
    }

    if ('properties' in schemaDef) {
      const props = schemaDef.properties ?? {};
      const requiredKeys = Array.isArray(schemaDef.required)
        ? schemaDef.required
        : [];

      for (const [key, value] of Object.entries<any>(props)) {
        ApiQuery({
          name: key,
          required: requiredKeys.includes(key),
          schema: value,
        })(
          target.constructor,
          propertyKey,
          Object.getOwnPropertyDescriptor(
            target.constructor.prototype,
            propertyKey,
          )!,
        );
      }
    }

    Query(pipe)(target, propertyKey, parameterIndex);
  };
}

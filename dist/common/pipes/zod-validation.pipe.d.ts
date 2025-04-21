import { PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';
export declare class Z implements PipeTransform {
    private schema;
    constructor(schema: ZodSchema);
    transform(value: unknown): any;
}

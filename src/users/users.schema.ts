
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';;

export const createCatSchema =z
  .object({
    name: z.string(),
    email: z.string(),
  }).required()

export class CreateCatDto extends createZodDto(createCatSchema) { }

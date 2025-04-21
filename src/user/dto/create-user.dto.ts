import { createZodDto } from "@anatine/zod-nestjs";
import { z } from "zod";

export const CreateUserSchema = z.object({
    email: z.string(),
    password: z.string()
})

// export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export class CreateUserDto extends createZodDto(CreateUserSchema) { }
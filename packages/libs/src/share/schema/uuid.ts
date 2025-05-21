import { z } from "zod";

export const uuidSchema = z.string().uuid();
export type uuidDto = z.infer<typeof uuidSchema>;

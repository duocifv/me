import { z } from "zod";

export const MeSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

export type LoginDto = {
  accessToken: string;
};
export type MeDto = z.infer<typeof MeSchema>;

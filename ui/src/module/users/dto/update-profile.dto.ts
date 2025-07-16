// src/users/dto/update-profile.dto.ts
import { z } from "zod";

export const UpdateProfileSchema = z.object({
  status: z.enum(["pending", "active", "blocked"]),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

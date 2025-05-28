import { z } from "zod";

const MediaVariantsSchema = z.object({
  thumbnail: z.string(),
  medium: z.string(),
  large: z.string(),
});

const MediaFileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  variants: MediaVariantsSchema,
  mimetype: z.string(),
  labels: z.array(z.any()).nullable(),
  size: z.number(),
  category: z.array(z.any()).nullable(),
  createdAt: z.string().transform((s) => new Date(s)),
});

export const PlantTypeSchema = z.object({
  id: z.number(),
  slug: z.string(),
  displayName: z.string(),
  mediaFileId: z.string().uuid(),
  mediaFile: MediaFileSchema,
  cropInstances: z.array(z.any()),
});

export type PlantTypeDto = z.infer<typeof PlantTypeSchema>;

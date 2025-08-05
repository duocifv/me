import { z } from "zod";

export const FeedbackSchema = z.object({
  reward: z.number().int().min(0),
  feedback: z.string().min(1),
});

export type FeedbackAI = z.infer<typeof FeedbackSchema>;

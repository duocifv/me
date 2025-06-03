import { z } from 'zod';

export const SensorDataSchema = z.object({
  waterTemp: z.number(),
  ambientTemp: z.number(),
  humidity: z.number(),
  // lightIntensity: z.number(),
});

export const SolutionDataSchema = z.object({
  ph: z.number(),
  ec: z.number(),
  orp: z.number(),
});

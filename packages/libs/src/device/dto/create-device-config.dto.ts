import { z } from "zod";

export const CreateDeviceConfigSchema = z.object({
  deviceId: z.string().max(32),
  version: z.number().int().nonnegative(),

  host: z.string().max(128),
  port: z.number().int().min(1).max(65535),

  sensorEndpoint: z.string().max(128),
  cameraEndpoint: z.string().max(128),

  dataInterval: z.number().int().min(1),
  imageInterval: z.number().int().min(1),

  pumpOn: z.boolean(),
  ledOn: z.boolean(),
  fanOn: z.boolean(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateDeviceConfigDto = z.infer<typeof CreateDeviceConfigSchema>;

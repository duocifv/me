// src/device-config/dto/create-device-config.schema.ts
import { z } from 'zod';

export const CreateDeviceConfigSchema = z.object({
  deviceId: z.string(),
  wifiSsid: z.string(),
  wifiPassword: z.string(),
  host: z.string(),
  port: z.number().int(),
  deepSleepIntervalUs: z.number().int(),
  sensorEndpoint: z.string(),
  cameraEndpoint: z.string(),
  sensorInterval: z.number().int(),
  dataInterval: z.number().int(),
  imageInterval: z.number().int(),
  pumpCycleMs: z.number().int(),
  pumpOnMs: z.number().int(),
  pumpOffMs: z.number().int(),
  pumpStartHour: z.number().int(),
  pumpEndHour: z.number().int(),
  ledCycleMs: z.number().int(),
  ledOnMs: z.number().int(),
  ledOffMs: z.number().int(),
  ledStartHour: z.number().int(),
  ledEndHour: z.number().int(),
  fanSmallOnMs: z.number().int(),
  fanSmallOffMs: z.number().int(),
  fanLargeContinuous: z.boolean(),
  fanLargeOnMs: z.number().int(),
  fanLargeOffMs: z.number().int(),
});

export type CreateDeviceConfigDto = z.infer<typeof CreateDeviceConfigSchema>;

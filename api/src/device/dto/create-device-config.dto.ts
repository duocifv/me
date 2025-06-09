// src/device-config/dto/create-device-config.schema.ts
import { z } from 'zod';

export const CreateDeviceConfigSchema = z.object({
  deviceId: z.string(),
  wifiSsid: z.string(),
  wifiPassword: z.string(),
  deepSleepIntervalUs: z.preprocess((val) => Number(val), z.number().int()),
  pumpOnTimeMs: z.preprocess((val) => Number(val), z.number().int()),
  sensorEndpoint: z.string(),
  cameraEndpoint: z.string(),
  deviceToken: z.string(),
  sensorInterval: z.preprocess((val) => Number(val), z.number().int()),
  dataInterval: z.preprocess((val) => Number(val), z.number().int()),
  imageInterval: z.preprocess((val) => Number(val), z.number().int()),
  pumpCycleMs: z.preprocess((val) => Number(val), z.number().int()),
  pumpOnMs: z.preprocess((val) => Number(val), z.number().int()),
});

// Tạo type từ schema
export type CreateDeviceConfigDto = z.infer<typeof CreateDeviceConfigSchema>;

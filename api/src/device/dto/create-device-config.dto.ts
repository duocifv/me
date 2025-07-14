import { z } from 'zod';

export const CreateDeviceConfigSchema = z.object({
  // ====== METADATA ======
  deviceId: z.string().max(32).default('device-001'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),

  // ====== SERVER ======
  host: z.string().max(128).default('my.duocnv.top'),
  port: z.number().int().min(1).max(65535).default(443),

  sensorEndpoint: z.string().max(128).default('/v1/hydroponics/snapshots'),
  cameraEndpoint: z
    .string()
    .max(128)
    .default('/v1/hydroponics/snapshots/images'),

  // ====== INTERVALS ======
  dataInterval: z.number().int().min(1).default(30000), // milliseconds
  imageInterval: z.number().int().min(1).default(20000), // milliseconds

  // ====== DEVICE FLAGS ======
  pumpOn: z.boolean().default(true),
  ledOn: z.boolean().default(true),
  fanOn: z.boolean().default(true),
});

export type CreateDeviceConfigDto = z.infer<typeof CreateDeviceConfigSchema>;

import { z } from "zod";
export const DeviceControlSchema = z.object({
  deviceId: z.string(),
  pumpOn: z.boolean().optional(),
  fanOn: z.boolean().optional(),
  ledOn: z.boolean().optional(),
  sensor: z.boolean().optional(),
  camera: z.boolean().optional(),
});

export type DeviceControlDto = z.infer<typeof DeviceControlSchema>;

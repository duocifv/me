import { z } from "zod";
export const DeviceControlSchema = z.object({
  deviceId: z.string(),
  pump: z.boolean().optional(),
  fan: z.boolean().optional(),
  led: z.boolean().optional(),
  sensor: z.boolean().optional(),
  camera: z.boolean().optional(),
});

export type DeviceControlDto = z.infer<typeof DeviceControlSchema>;

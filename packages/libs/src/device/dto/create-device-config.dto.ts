import { z } from "zod";

export const CreateDeviceConfigSchema = z
  .object({
    deviceId: z.string(),
    wifiSsid: z.string(),
    wifiPassword: z.string(),
    host: z.string(),
    port: z.number().int().min(1).max(65535),
    deepSleepIntervalUs: z.number().int().min(1), // ≥ 1s

    sensorEndpoint: z.string(),
    cameraEndpoint: z.string(),

    sensorInterval: z.number().int().min(1),
    dataInterval: z.number().int().min(1),
    imageInterval: z.number().int().min(1),

    pumpCycleMs: z.number().int().min(1),
    pumpOnMs: z.number().int().min(1),
    pumpOffMs: z.number().int().min(1),
    pumpStartHour: z.number().int().min(0).max(23),
    pumpEndHour: z.number().int().min(0).max(23),

    ledCycleMs: z.number().int().min(1),
    ledOnMs: z.number().int().min(1),
    ledOffMs: z.number().int().min(1),
    ledStartHour: z.number().int().min(0).max(23),
    ledEndHour: z.number().int().min(0).max(23),

    fanSmallOnMs: z.number().int().min(1),
    fanSmallOffMs: z.number().int().min(1),

    fanLargeContinuous: z.boolean(),
    fanLargeOnMs: z.number().int().min(1),
    fanLargeOffMs: z.number().int().min(1),
  })
  .refine((data) => data.pumpStartHour <= data.pumpEndHour, {
    path: ["pumpEndHour"],
    message: "pumpEndHour phải ≥ pumpStartHour",
  })
  .refine((data) => data.ledStartHour <= data.ledEndHour, {
    path: ["ledEndHour"],
    message: "ledEndHour phải ≥ ledStartHour",
  })
  .refine((data) => data.pumpOnMs + data.pumpOffMs <= data.pumpCycleMs, {
    message: "Tổng pumpOn + pumpOff không được vượt quá pumpCycleSeconds",
  })
  .refine((data) => data.ledOnMs + data.ledOffMs <= data.ledCycleMs, {
    message: "Tổng ledOn + ledOff không được vượt quá ledCycleSeconds",
  })
  .refine(
    (data) =>
      data.fanLargeContinuous ||
      (data.fanLargeOnMs > 0 && data.fanLargeOffMs > 0),
    {
      message:
        "Nếu fanLargeContinuous = false thì fanLargeOnSeconds và fanLargeOffSeconds phải > 0",
    }
  );

export type CreateDeviceConfigDto = z.infer<typeof CreateDeviceConfigSchema>;

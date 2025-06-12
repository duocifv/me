import { z } from 'zod';

const DEFAULT_WIFI_SSID = 'Wokwi-GUEST';
const DEFAULT_WIFI_PASSWORD = '';
const DEFAULT_SENSOR_ENDPOINT = '/v1/hydroponics/snapshots';
const DEFAULT_CAMERA_ENDPOINT = '/v1/hydroponics/snapshots/images';
const DEFAULT_HOST = 'my.duocnv.top';
const DEFAULT_POST = 443;

export const CreateDeviceConfigSchema = z
  .object({
    deviceId: z.string().default('device-001'),
    wifiSsid: z.string().default(DEFAULT_WIFI_SSID),
    wifiPassword: z.string().default(DEFAULT_WIFI_PASSWORD),
    host: z.string().default(DEFAULT_HOST),
    port: z.number().int().min(1).max(65535).default(DEFAULT_POST),
    deepSleepIntervalUs: z.number().int().min(1), // ≥ 1s

    sensorEndpoint: z.string().default(DEFAULT_SENSOR_ENDPOINT),
    cameraEndpoint: z.string().default(DEFAULT_CAMERA_ENDPOINT),

    sensorInterval: z.number().int().min(1).default(10),
    dataInterval: z.number().int().min(1).default(15),
    imageInterval: z.number().int().min(1).default(20),

    pumpCycleMs: z.number().int().min(1).default(120),
    pumpOnMs: z.number().int().min(1).default(30),
    pumpOffMs: z.number().int().min(1).default(60),
    pumpStartHour: z.number().int().min(0).max(23).default(6),
    pumpEndHour: z.number().int().min(0).max(23).default(18),

    ledCycleMs: z.number().int().min(1).default(300),
    ledOnMs: z.number().int().min(1).default(120),
    ledOffMs: z.number().int().min(1).default(150),
    ledStartHour: z.number().int().min(0).max(23).default(8),
    ledEndHour: z.number().int().min(0).max(23).default(20),

    fanSmallOnMs: z.number().int().min(1).default(30),
    fanSmallOffMs: z.number().int().min(1).default(30),

    fanLargeContinuous: z.boolean().default(true),
    fanLargeOnMs: z.number().int().min(1).default(40),
    fanLargeOffMs: z.number().int().min(1).default(60),
  })
  .refine((data) => data.pumpStartHour <= data.pumpEndHour, {
    path: ['pumpEndHour'],
    message: 'pumpEndHour phải ≥ pumpStartHour',
  })
  .refine((data) => data.ledStartHour <= data.ledEndHour, {
    path: ['ledEndHour'],
    message: 'ledEndHour phải ≥ ledStartHour',
  })
  .refine((data) => data.pumpOnMs + data.pumpOffMs <= data.pumpCycleMs, {
    message: 'Tổng pumpOn + pumpOff không được vượt quá pumpCycleSeconds',
  })
  .refine((data) => data.ledOnMs + data.ledOffMs <= data.ledCycleMs, {
    message: 'Tổng ledOn + ledOff không được vượt quá ledCycleSeconds',
  })
  .refine(
    (data) =>
      data.fanLargeContinuous ||
      (data.fanLargeOnMs > 0 && data.fanLargeOffMs > 0),
    {
      message:
        'Nếu fanLargeContinuous = false thì fanLargeOnSeconds và fanLargeOffSeconds phải > 0',
    },
  );

export type CreateDeviceConfigDto = z.infer<typeof CreateDeviceConfigSchema>;

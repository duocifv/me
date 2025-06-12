// src/device-error/dto/report-device-error.schema.ts
import { z } from "zod";

export const ReportDeviceErrorSchema = z.object({
  error_code: z.string(),
  error_message: z.string(),
});

export type ReportDeviceErrorDto = z.infer<typeof ReportDeviceErrorSchema>;

export interface DeviceErrorEntity {
  id: number;
  deviceId: string;
  errorCode: string;
  errorMessage: string;
  createdAt: string;
}

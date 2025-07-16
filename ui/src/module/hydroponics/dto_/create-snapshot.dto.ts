import { z } from "zod";

// Định nghĩa các loại sensor
export const SensorTypeSchema = z.enum([
  "water_temperature", // nhiệt độ nước
  "ambient_temperature", // nhiệt độ không khí
  "humidity", // độ ẩm
  "light_intensity", // cường độ ánh sáng
]);

// Định nghĩa các thông số dung dịch (nutrient solution)
export const SolutionParamSchema = z.enum([
  "ph", // độ pH
  "ec", // conductivity (điện dẫn suất)
  "orp", // oxidation-reduction potential
]);

export const CreateSnapshotSchema = z.object({
  sensorData: z.record(SensorTypeSchema, z.number()),
  solutionData: z.record(SolutionParamSchema, z.number()),
});

export type CreateSnapshotDto = z.infer<typeof CreateSnapshotSchema>;

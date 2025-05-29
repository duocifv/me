import { z } from 'zod';

// Định nghĩa các loại sensor
export const SensorTypeSchema = z.enum([
  'water_temperature', // nhiệt độ nước
  'ambient_temperature', // nhiệt độ không khí
  'humidity', // độ ẩm
  'light_intensity', // cường độ ánh sáng
]);

// Định nghĩa các thông số dung dịch (nutrient solution)
export const SolutionParamSchema = z.enum([
  'ph', // độ pH
  'ec', // conductivity (điện dẫn suất)
  'orp', // oxidation-reduction potential
]);

export const CreateSnapshotSchema = z.object({
  sensorData: z.record(
    SensorTypeSchema,
    z.number({
      required_error: 'sensorData phải chứa giá trị số cho mỗi sensor',
      invalid_type_error: 'Giá trị sensorData phải là số',
    }),
    {
      required_error: 'sensorData là bắt buộc',
      invalid_type_error: 'sensorData phải là object với key là loại sensor',
    },
  ),
  solutionData: z.record(
    SolutionParamSchema,
    z.number({
      required_error: 'solutionData phải chứa giá trị số cho mỗi thông số',
      invalid_type_error: 'Giá trị solutionData phải là số',
    }),
    {
      required_error: 'solutionData là bắt buộc',
      invalid_type_error:
        'solutionData phải là object với key là thông số dung dịch',
    },
  ),
});

export type CreateSnapshotDto = z.infer<typeof CreateSnapshotSchema>;

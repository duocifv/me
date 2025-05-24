import { z } from 'zod';

export const CreateSnapshotSchema = z.object({
  sensorData: z.record(z.any(), {
    required_error: 'sensorData là bắt buộc',
    invalid_type_error: 'sensorData phải là object',
  }),
  solutionData: z.record(z.any(), {
    required_error: 'solutionData là bắt buộc',
    invalid_type_error: 'solutionData phải là object',
  }),
});

export type CreateSnapshotDto = z.infer<typeof CreateSnapshotSchema>;

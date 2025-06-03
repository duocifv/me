// src/dto/create-snapshot.dto.ts
import { z } from 'zod';
import {
  SensorDataSchema,
  SolutionDataSchema,
} from './sensor-solution-schemas';

export const CreateSnapshotSchema = z.object({
  sensorData: SensorDataSchema,
  solutionData: SolutionDataSchema,
});

export type CreateSnapshotDto = z.infer<typeof CreateSnapshotSchema>;

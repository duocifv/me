export interface SnapshotImage {
  id: number;
  snapshotId: number;
  filename: string;
  url: string;
  mimetype: string;
}
export interface SensorData {
  water_temperature: number;
  ambient_temperature: number;
  humidity: number;
}
export interface SolutionData {
  ph: number;
  ec: number;
  orp: number;
}
export interface Snapshot {
  id: number;
  cropInstanceId: number;
  timestamp: string;
  sensorData: SensorData | null;
  solutionData: SolutionData | null;
  isActive: boolean;
  images: SnapshotImage[];
}

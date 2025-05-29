export interface SnapshotImage {
  id: number;
  snapshotId: number;
  filename: string;
  url: string;
  mimetype: string;
}

export interface Snapshot {
  id: number;
  cropInstanceId: number;
  timestamp: string;
  sensorData: Record<string, any> | null;
  solutionData: Record<string, any> | null;
  isActive: boolean;
  images: SnapshotImage[];
}

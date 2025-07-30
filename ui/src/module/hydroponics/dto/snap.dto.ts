export interface CameraImage {
  id: string;
  url: string;
  time: string; // ISO 8601
}

export interface CameraSnapshot {
  images: CameraImage[];
}

export interface SensorSnapshot {
  waterTemperature: number;
  ambientTemperature: number;
  humidity: number;
  time: string;
}

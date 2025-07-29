export interface CameraImage {
  id: string | number;
  url: string;
}

export interface CameraSnapshot {
  images: CameraImage[];
}

export interface SensorSnapshot {
  waterTemperature: number;
  ambientTemperature: number;
  humidity: number;
}

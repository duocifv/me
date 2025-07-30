export interface SensorSnapshot {
  waterTemperature: number;
  ambientTemperature: number;
  humidity: number;
  time: string; // dạng ISO 8601
}

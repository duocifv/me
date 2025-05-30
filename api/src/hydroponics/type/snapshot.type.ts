export interface SensorData {
  water_temperature?: number;
  ambient_temperature?: number;
  humidity?: number;
  light_intensity?: number;
}

export interface SolutionData {
  ph?: number;
  ec?: number;
  orp?: number;
}

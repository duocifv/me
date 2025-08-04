export class AiScheduleLogDto {
  id: string;
  createdAt: Date;
  inputEnv: {
    waterTemperature: number;
    ambientTemperature: number;
    humidity: number;
  };
  schedule: any;
  note: string;
  reward?: number;
  status: 'pending' | 'evaluated';
}

// Môi trường đầu vào
export interface InputEnv {
  waterTemperature: number;
  ambientTemperature: number;
  humidity: number;
}

// Khoảng thời gian bật/tắt
export interface TimeSlot {
  start: string; // định dạng "HH:MM"
  end: string; // định dạng "HH:MM"
}

// Một mục lịch cho từng thiết bị
export interface ScheduleItem {
  deviceId: string;
  device: "pumpOn" | "fanOn" | "ledOn";
  times: TimeSlot[];
}

// Trạng thái chung của bản ghi lịch AI
export type ScheduleStatus = "pending" | "approved" | "rejected" | "running";

// Toàn bộ cấu trúc một bản ghi lịch AI
export interface AiScheduleRecord {
  id: number;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  inputEnv: InputEnv;
  schedule: ScheduleItem[];
  note: string;
  reward: number | null;
  status: ScheduleStatus;
  feedback: string | null;
  evaluatedAt: string | null; // ISO timestamp hoặc null
}

// Và nếu bạn nhận về một mảng:
export type AiScheduleResponse = AiScheduleRecord[];

export interface TimeRange {
  start: string; // dạng "HH:mm"
  end: string; // dạng "HH:mm"
}

export interface ScheduleItem {
  device: "pump" | "led" | "fanCool" | "fanVent" | "sensors" | "camera";
  times: TimeRange[];
  repeatOn: string[];
  isEnabled: boolean;
  id: number;
}

// Kiểu cho toàn bộ danh sách schedules
export type ScheduleList = ScheduleItem[];

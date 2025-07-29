export interface TimeRange {
  start: string; // dạng "HH:mm"
  end: string; // dạng "HH:mm"
}

export interface ScheduleItem {
  device: "fan" | "pump" | "led" | "sensor" | "camera"; // hoặc string nếu có thêm
  times: TimeRange[];
  repeatOn: number[]; // 0 = Chủ nhật, 6 = Thứ 7
  isEnabled: boolean;
  id: string; // hoặc có thể là number nếu không cần chuỗi
}

// Kiểu cho toàn bộ danh sách schedules
export type ScheduleList = ScheduleItem[];

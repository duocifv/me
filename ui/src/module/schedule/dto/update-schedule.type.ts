export interface TimeRange {
  start: string; // định dạng "HH:mm", nên validate ở runtime nếu cần
  end: string;
}

export interface UpdateScheduleDto {
  times?: TimeRange[]; // ít nhất 1 phần tử nếu có
  repeatOn?: number[]; // các số từ 0 đến 6
  isEnabled?: boolean;
}

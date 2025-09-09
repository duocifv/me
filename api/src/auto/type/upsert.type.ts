// Metadata có thể chứa nhiều field linh hoạt
interface Metadata {
  category: string;
  author: string;
  [key: string]: any; // cho phép thêm các field khác nếu cần
}

// Kiểu của từng item
interface UpsertItem {
  id: string;
  document: string;
  metadata?: Metadata;
}

// Kiểu của payload chính
export interface UpsertPayload {
  items: UpsertItem[];
}

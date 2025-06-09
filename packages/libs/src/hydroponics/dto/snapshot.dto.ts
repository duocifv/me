export interface Snapshot {
  id: number;
  cropInstanceId: number;
  timestamp: string;
  isActive: boolean;
  waterTemp: number;
  ambientTemp: number;
  humidity: number;
  ph: number;
  ec: number;
  orp: number;
  images: SnapshotImage[];
}

export interface SnapshotImage {
  id: number;
  snapshotId: number;
  filename: string;
  url: string;
  mimetype: string;
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginationLinks {
  first: string;
  previous: string;
  next: string;
  last: string;
}

export interface SnapshotResponse {
  items: Snapshot[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

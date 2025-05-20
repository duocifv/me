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

export interface MediaStats {
  totalFile: number;
  totalStorage: number;
  imagesStorage: number;
}

export interface MediaFile {
  id: string;
  variants: {
    thumbnail: string;
    medium: string;
    large: string;
  };
  mimetype: string;
  size: number;
  createdAt: Date;
}

export interface PaginatedMediaResponse {
  items: MediaFile[];
  meta: PaginationMeta;
  links: PaginationLinks;
  stats: MediaStats;
}

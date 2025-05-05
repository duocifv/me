export interface IPaginationMeta {
  itemCount: number;
  totalItems?: number;
  itemsPerPage: number;
  totalPages?: number;
  currentPage: number;
}

export interface IPaginationLinks {
  first?: string;
  previous?: string;
  next?: string;
  last?: string;
}

export interface IPagination {
  meta: IPaginationMeta;
  link: IPaginationLinks;
}

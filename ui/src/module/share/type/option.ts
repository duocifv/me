import { PaginationMeta } from "../schema/meta";

export type OptionQuery<T> = {
  queryKey: [string, Record<string, unknown>];
  queryFn: () => Promise<PaginationMeta<T>>;
  staleTime: number;
};

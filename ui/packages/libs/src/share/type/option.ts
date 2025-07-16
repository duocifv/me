import { PaginationMeta } from "../schema/meta";

export type OptionQuery<T> = {
  queryKey: [string, Record<string, any>];
  queryFn: () => Promise<PaginationMeta<T>>;
  staleTime: number;
};

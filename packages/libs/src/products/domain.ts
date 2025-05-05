import { z } from "zod";
import { PaginationMeta } from "../share/schema/meta";
import { productsSchema } from "./schema";
import { QueryParams } from "../share/schema/query-params";
export type Products = z.infer<typeof productsSchema>;
export type PaginationProducts = PaginationMeta<Products>
export interface ProductsService {
  getAll: (options?: QueryParams) => Promise<PaginationProducts>;
  // getById: (id: number) => Promise<Products>;
  // create: (post: Products) => Promise<Products>;
  // update: (post: Products) => Promise<Products>;
  // delete: (id: number) => Promise<void>;
}

export interface ProductsState {
  filters: QueryParams;
  alert: { message?: string; type: "error" | "success" } | null;
  setFilters: (value: QueryParams) => void;
  setAlert: (value: { message?: string; type: "error" | "success" }) => void;
  // useGetById: (value: number) => UseQueryResult<Products>;
  // useCreate: () => UseMutationResult<Products, Error, Products, unknown>;
  // useUpdate: () => UseMutationResult<Products, Error, Products, unknown>;
  // useDelete: () => UseMutationResult<void, Error, number, unknown>;
}

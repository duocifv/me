import { $get } from "../share/api/apiHelpers";
import { ProductsService } from "./domain";
import { productsSchema } from "./schema";
import { paginationSchema } from "../share/schema/meta";
import { queryParamsSchema } from "../share/schema/query-params";

export const productsService = (): ProductsService => ({
  async getAll(query = {}) {
    const params = queryParamsSchema.parse(query);
    const { data } = await $get("products", params);
    const results = paginationSchema(productsSchema, data);
    return results;
  },
});

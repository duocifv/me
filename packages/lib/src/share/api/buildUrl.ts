import qs from "qs";
import { ReqParams } from "./types";
import { $config } from "../config/env";

/**
 * Xây dựng URL đầy đủ từ đường dẫn và tham số query.
 */

export const makeUrl = (path: string, params?: ReqParams): string => {
  const url = `${$config.API_URL}/${path}`;
  return params && Object.keys(params).length
    ? `${url}?${qs.stringify(params, { encodeValuesOnly: true })}`
    : url;
};


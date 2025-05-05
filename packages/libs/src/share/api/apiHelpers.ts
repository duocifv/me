
import type { ApiOpts } from "./types";
import { callApi } from "./callApi";
import { log } from "./logger";

/**
 * GET request: Nếu thành công trả về dữ liệu kiểu T, nếu có lỗi thì ném lỗi.
 */
export async function $get<T>(
  path: string,
  params?: Record<string, any>,
  opts?: ApiOpts<T>
): Promise<{
  data: T;
  error: string | null;
}> {
  const { data, error, status } = await callApi<T>("GET", path, {
    params,
    ...opts,
  });
  // Nếu có lỗi, log và ném lỗi
  if (error) {
    log.error(`GET ${path} error:`);
    throw new Error(`HTTP ${status} - ${error}`);
  }

  // Nếu không có dữ liệu
  if (data === null || data === undefined) {
    log.error("No data received");
    throw new Error("No data received");
  }
  return {
    data,
    error,
  };
}

/**
 * POST request: Nếu thành công trả về dữ liệu kiểu T, nếu có lỗi thì ném lỗi.
 */
export async function $post<T>(
  path: string,
  body: Record<string, unknown>,
  opts?: ApiOpts<T>
): Promise<{
  data: T;
  error: string | null;
}> {
  const { data, error, status } = await callApi<T>("POST", path, {
    ...opts,
    body,
  });
  if (error) {
    throw new Error(`HTTP ${status} - ${error}`);
  }
  if (data === null || data === undefined) {
    throw new Error("No data received");
  }
  return {
    data,
    error,
  };
}

/**
 * PUT request: Nếu thành công trả về dữ liệu kiểu T, nếu có lỗi thì ném lỗi.
 */
export async function $put<T>(
  path: string,
  body: Record<string, unknown>,
  opts?: ApiOpts<T>
): Promise<{
  data: T;
  error: string | null;
}>{
  const { data, error, status } = await callApi<T>("PUT", path, {
    ...opts,
    body,
  });
  if (error) {
    throw new Error(`HTTP ${status} - ${error}`);
  }
  if (data === null || data === undefined) {
    throw new Error("No data received");
  }
  return {
    data,
    error,
  };
}

/**
 * DELETE request: Nếu thành công trả về dữ liệu kiểu T, nếu có lỗi thì ném lỗi.
 */
export async function $del<T>(path: string, opts?: ApiOpts<T>): Promise<T> {
  const { data, error, status } = await callApi<T>("DELETE", path, opts);
  if (error) {
    throw new Error(`HTTP ${status} - ${error}`);
  }
  if (data === null || data === undefined) {
    throw new Error("No data received");
  }
  return data as T;
}

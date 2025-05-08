import type { ApiOpts } from "./types";
import { callApi } from "./callApi";
import { log } from "./logger";
import { ApiError } from "./Error";

/**
 * GET request: Nếu thành công trả về dữ liệu kiểu T, nếu có lỗi thì ném lỗi.
 */
export async function $get<T>(
  path: string,
  params?: Record<string, any>,
  opts?: ApiOpts<T>
): Promise<T> {
  const { data, error, status } = await callApi<T>("GET", path, {
    params,
    ...opts,
  });

  if (error) {
    throw new ApiError(error.message, status);
  }

  // Nếu không có dữ liệu
  if (data === null || data === undefined) {
    log.error("No data received");
    throw new Error("No data received");
  }

  return data;
}

/**
 * POST request: Nếu thành công trả về dữ liệu kiểu T, nếu có lỗi thì ném lỗi.
 */
export async function $post<T>(
  path: string,
  body: Record<string, unknown>,
  opts?: ApiOpts<T>
): Promise<T> {
  const { data, error, status, statusText } = await callApi<T>("POST", path, {
    ...opts,
    body,
  });
  if (error) {
    throw new ApiError(error.message, status);
  }
  if (data === null || data === undefined) {
    throw new ApiError("No data received", status);
  }
  return data;
}

/**
 * PUT request: Nếu thành công trả về dữ liệu kiểu T, nếu có lỗi thì ném lỗi.
 */
export async function $put<T>(
  path: string,
  body: Record<string, unknown>,
  opts?: ApiOpts<T>
): Promise<T> {
  const { data, error, status } = await callApi<T>("PUT", path, {
    ...opts,
    body,
  });
  if (error) {
    throw new ApiError(error.message, status);
  }
  if (data === null || data === undefined) {
    throw new Error("No data received");
  }
  return data;
}

/**
 * DELETE request: Nếu thành công trả về dữ liệu kiểu T, nếu có lỗi thì ném lỗi.
 */
export async function $del<T>(path: string, opts?: ApiOpts<T>): Promise<T> {
  const { data, error, status } = await callApi<T>("DELETE", path, opts);
  if (error) {
    throw new ApiError(error.message, status);
  }
  if (data === null || data === undefined) {
    throw new Error("No data received");
  }
  return data;
}

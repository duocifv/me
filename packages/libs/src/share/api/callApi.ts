import type { HttpMethod, ApiOpts } from "./types";
import { makeUrl } from "./buildUrl";
import { log } from "./logger";
import { retryFetch } from "./retryFetch";
import { ErrorRespose, zodValidation } from "./error";

/**
 * Gọi API với timeout và retry, trả về kết quả theo cấu trúc:
 * { data, error, status, statusText }
 * Lưu ý: error là object để đảm bảo UI có thể xử lý lỗi hợp lệ.
 */
export const callApi = async <T>(
  method: HttpMethod,
  path: string,
  {
    params = {},
    body,
    headers = {},
    timeout = 5000,
    fallback = null,
    credentials = "same-origin",
  }: ApiOpts<T> = {}
): Promise<{
  data: T | null;
  error: ErrorRespose | null;
  status?: number;
  statusText?: string;
  failed?: zodValidation;
}> => {
  const url = makeUrl(path, params);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  if (body !== undefined && body !== null) {
    headers = { "Content-Type": "application/json", ...headers };
  }

  try {
    log.info(`Call API: ${url} [${method}]`);

    const requestOpts: RequestInit = {
      method,
      headers,
      signal: controller.signal,
      credentials,
      ...(method !== "GET" && body ? { body: JSON.stringify(body) } : {}),
    };

    return await retryFetch<T>(url, requestOpts);
  } catch (err: unknown) {
    let errorResponse: ErrorRespose = {
      message: "Unknown error",
      statusCode: 500,
    };

    if (err instanceof Error) {
      try {
        const parsed = JSON.parse(err.message);
        errorResponse = {
          message: parsed.message || err.message,
          errors: parsed.errors,
          statusCode: parsed.statusCode || 500,
        };
      } catch {
        errorResponse = {
          message: err.message,
          statusCode: 500,
        };
      }
      log.error(`API error: ${err.message}`);
    } else {
      log.error(`Unknown API error: ${String(err)}`);
    }

    if (fallback !== null) {
      return {
        data: fallback as T,
        error: errorResponse,
        status: errorResponse.statusCode,
        statusText: "Error",
      };
    }

    return {
      data: null,
      error: errorResponse,
      status: errorResponse.statusCode,
      statusText: "Error",
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

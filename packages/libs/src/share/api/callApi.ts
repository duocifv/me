import type { HttpMethod, ApiOpts } from "./types";
import { makeUrl } from "./buildUrl";
import { log } from "./logger";
import { retryFetch } from "./retryFetch";
import { authService } from "./authService";

/**
 * Gọi API với timeout và retry, trả về kết quả theo cấu trúc:
 * { data, error, status, statusText }
 * Lưu ý: error là string để đảm bảo tính serializable cho UI.
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
  }: ApiOpts<T> = {}
): Promise<{
  data: T | null;
  error: string | null;
  status?: number;
  statusText?: string;
}> => {
  const url = makeUrl(path, params);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const token = authService.getToken();
  if (token) {
    headers = { ...headers, Authorization: `Bearer ${token}` };
  }

  try {
    log.info(`Call API: ${url} [${method}]`);
    const requestOpts: RequestInit = {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      signal: controller.signal,
      ...(method !== "GET" && body ? { body: JSON.stringify(body) } : {}),
    };

    return await retryFetch<T>(url, requestOpts);
  } catch (err: unknown) {
    let errorMessage: string;
    if (err instanceof Error) {
      errorMessage = err.message;
      log.error(`API error: ${errorMessage}`);
    } else {
      errorMessage = "Unknown API error";
      log.error(`Unknown API error: ${String(err)}`);
    }
    if (fallback !== null) {
      return {
        data: fallback as T,
        error: errorMessage,
        status: 500,
        statusText: "Error",
      };
    }
    throw new Error(errorMessage);
  } finally {
    clearTimeout(timeoutId);
  }
};

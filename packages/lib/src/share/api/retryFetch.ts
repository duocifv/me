import { log } from "./logger";

const delayRetry = (attempt: number, baseDelay: number) =>
  new Promise((resolve) =>
    setTimeout(resolve, baseDelay * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 300))
  );

/**
 * Thực hiện fetch với cơ chế retry (exponential backoff + jitter).
 * Trả về kết quả theo cấu trúc: { data, error, status, statusText }.
 * Lưu ý: error là string đã được "sanitized" để hiển thị trong UI.
 */
export const retryFetch = async <T>(
  url: string,
  opts: RequestInit = {},
  maxRetries = 3,
  baseDelay = 500,
  attempt = 1
): Promise<{ data: T | null; error: string | null; status: number; statusText: string }> => {
  try {
    const res = await fetch(url, opts);

    // Nếu trạng thái 204 (No Content), trả về dữ liệu rỗng
    if (res.status === 204) {
      return { data: {} as T, error: null, status: res.status, statusText: res.statusText };
    }
    // Nếu trạng thái 404, trả về null
    if (res.status === 404) {
      return { data: null, error: `Not Found`, status: res.status, statusText: res.statusText };
    }
    // Nếu không OK, thử retry cho các trạng thái có thể recover (429, 500, 503)
    if (!res.ok) {
      if ([429, 500, 503].includes(res.status) && attempt <= maxRetries) {
        log.warn(`HTTP ${res.status}: Đang thử lại lần ${attempt}/${maxRetries}`);
        await delayRetry(attempt, baseDelay);
        return retryFetch<T>(url, opts, maxRetries, baseDelay, attempt + 1);
      }
      const errors = await res.json();
      return {
        data: null,
        error: `Đã xảy ra lỗi HTTP khi tải dữ liệu:\n${JSON.stringify(errors, null, 2)}`,
        status: res.status,
        statusText: res.statusText,
      };
    }
    
    // Nếu thành công, parse JSON
    const data = await res.json();
    log.ok("200 - OK");
    return { data, error: null, status: res.status, statusText: res.statusText };
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return {
          data: null,
          error: "Yêu cầu đã bị hủy, vui lòng thử lại sau.",
          status: 408,
          statusText: "Request Timeout",
        };
      }
      if (attempt <= maxRetries) {
        log.warn(`Error: ${err.message}. Đang thử lại lần ${attempt}/${maxRetries}`);
        await delayRetry(attempt, baseDelay);
        return retryFetch<T>(url, opts, maxRetries, baseDelay, attempt + 1);
      }
      return {
        data: null,
        error: err.message,
        status: 500,
        statusText: "Error",
      };
    }
    return {
      data: null,
      error: "Lỗi không xác định khi tải dữ liệu",
      status: 500,
      statusText: "Error",
    };
  }
};

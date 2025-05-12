import { ErrorRespose } from "./error";
import { log } from "./logger";

const delayRetry = (attempt: number, baseDelay: number) =>
  new Promise((resolve) =>
    setTimeout(
      resolve,
      baseDelay * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 300)
    )
  );

/**
 * Thực hiện fetch với cơ chế retry (exponential backoff + jitter).
 * Trả về kết quả theo cấu trúc: { data, error, status, statusText }.
 * Lưu ý: error là object dạng ErrorRespose (để hiển thị hợp lệ cho UI).
 */
export const retryFetch = async <T>(
  url: string,
  opts: RequestInit = {},
  maxRetries = 3,
  baseDelay = 500,
  attempt = 1
): Promise<{
  data: T | null;
  error: ErrorRespose | null;
  status: number;
  statusText: string;
}> => {
  try {
    console.log("urlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurl", url);
    const res = await fetch(url, opts);
    const status = res.status;
    const statusText = res.statusText;

    // Nếu không có nội dung (204)
    if (status === 204) {
      return {
        data: {} as T,
        error: null,
        status,
        statusText,
      };
    }

    let resData: any = null;
    try {
      resData = await res.json();
    } catch {
      resData = null;
    }

    const actualData = resData?.data ?? resData;

    if (!res.ok) {
      // Retry nếu status nằm trong danh sách có thể recover
      const retryableStatus = [429, 500, 502, 503, 504];
      if (retryableStatus.includes(status) && attempt <= maxRetries) {
        log.warn(`HTTP ${status}: Đang thử lại lần ${attempt}/${maxRetries}`);
        await delayRetry(attempt, baseDelay);
        return retryFetch<T>(url, opts, maxRetries, baseDelay, attempt + 1);
      }

      const error: ErrorRespose = {
        message: resData?.message || "Lỗi từ máy chủ",
        errors: resData?.errors || null,
        statusCode: status,
      };

      return {
        data: null,
        error,
        status,
        statusText,
      };
    }

    // Thành công
    log.ok(`${status} - OK`);
    return {
      data: actualData,
      error: null,
      status,
      statusText,
    };
  } catch (err: any) {
    if (err.name === "AbortError") {
      return {
        data: null,
        error: {
          message: "Yêu cầu đã bị hủy, vui lòng thử lại sau.",
          statusCode: 408,
        },
        status: 408,
        statusText: "Request Timeout",
      };
    }

    if (attempt <= maxRetries) {
      log.warn(
        `Lỗi: ${err.message}. Đang thử lại lần ${attempt}/${maxRetries}`
      );
      await delayRetry(attempt, baseDelay);
      return retryFetch<T>(url, opts, maxRetries, baseDelay, attempt + 1);
    }

    return {
      data: null,
      error: {
        message: err.message || "Lỗi không xác định khi tải dữ liệu",
        statusCode: 500,
      },
      status: 500,
      statusText: "Error",
    };
  }
};

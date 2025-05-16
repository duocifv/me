export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ReqParams {
  [key: string]: string | number | boolean;
}

/**
 * Tùy chọn cho API client.
 */
export interface ApiOpts<T> {
  params?: Record<string, string | number | boolean>;
  cache?: RequestCache;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
  fallback?: T | null;
  credentials?: RequestCredentials;
  useFingerprint?: boolean;
}

/**
 * (Tùy chọn mở rộng cho fetch - dự phòng nếu cần sử dụng trong tương lai)
 */
export interface FetchOpts extends RequestInit {
  retries?: number;
  retryDelay?: number;
  retryOn?: (
    attempt: number,
    err: Error | null,
    res: Response | null
  ) => boolean | Promise<boolean>;
}

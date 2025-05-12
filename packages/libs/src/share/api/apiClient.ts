import type { HttpMethod, ApiOpts } from "./types";
import { callApi } from "./callApi";
import { ApiError } from "./error";

export class ApiClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<void> | null = null;
  private readonly prefix: string;

  constructor(prefix: string = "") {
    this.prefix = prefix.trim().replace(/^\/+|\/+$/g, "");
  }

  private fullPath(path: string): string {
    return this.prefix ? `${this.prefix}/${path}` : path;
  }

  setToken(token: string): void {
    this.accessToken = token;
  }

  private clearToken(): void {
    this.accessToken = null;
  }

  hasToken(): boolean {
    return !!this.accessToken;
  }

  /**
   * Refresh access token (singleton promise to dedupe concurrent calls).
   */
  private refreshToken(): Promise<void> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const { data, error, status } = await callApi<{
            accessToken: string;
          }>("POST", "auth/token", { credentials: "include" });

          if (status === 401) {
            // refresh token invalid or expired
            this.clearToken();
            throw new ApiError("RefreshExpired", 401, "RefreshExpired");
          }

          if (error || !data) {
            this.clearToken();
            throw new ApiError(
              error?.message || "Refresh token failed",
              error?.statusCode || status || 500,
              "RefreshError"
            );
          }

          this.setToken(data.accessToken);
        } catch (error) {
          this.clearToken();
          throw error;
        }
      })();

      this.refreshPromise.finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    opts: ApiOpts<T> = {},
    isRetry = false
  ): Promise<T> {
    const fullPath = this.fullPath(path);
    const headers = {
      ...(opts.headers || {}),
      ...(this.accessToken
        ? { Authorization: `Bearer ${this.accessToken}` }
        : {}),
    };

    const callOpts = { ...opts, headers };
    const { data, error, status } = await callApi<T>(
      method,
      fullPath,
      callOpts
    );

    if (status === 401 && !isRetry) {
  try {
    await this.refreshToken();
    return this.request(method, path, opts, true);
  } catch {
    throw new ApiError("RefreshFailed", 401, "RefreshFailed");
  }
}

    if (error) {
      throw new ApiError(
        error.message,
        error.statusCode,
        status === 401 ? "Unauthorized" : "ApiError"
      );
    }

    if (data == null) {
      throw new ApiError("Empty response", status || 500, "NoData");
    }

    return data;
  }

  async get<T>(
    path: string,
    params?: Record<string, any>,
    opts?: ApiOpts<T>
  ): Promise<T> {
    return this.request<T>("GET", path, { ...opts, params });
  }

  async post<T>(
    path: string,
    body: Record<string, unknown>,
    opts?: ApiOpts<T>
  ): Promise<T> {
    return this.request<T>("POST", path, { ...opts, body });
  }

  async put<T>(
    path: string,
    body: Record<string, unknown>,
    opts?: ApiOpts<T>
  ): Promise<T> {
    return this.request<T>("PUT", path, { ...opts, body });
  }

  async delete<T>(path: string, opts?: ApiOpts<T>): Promise<T> {
    return this.request<T>("DELETE", path, opts);
  }

  async patch<T>(path: string, body: any, opts?: ApiOpts<T>) {
  return this.request<T>("PATCH", path, { ...opts, body });
}
  group(prefix: string) {
    return new ApiClient(prefix);
  }
}

export const api = new ApiClient();

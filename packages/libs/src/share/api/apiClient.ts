import type { HttpMethod, ApiOpts } from "./types";
import { callApi } from "./callApi";
import { ApiError } from "./error";

export class ApiClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<void> | null = null;
  private readonly prefix: string;

  constructor(prefix: string = "") {
    // Trim and remove extra slashes
    this.prefix = prefix.trim().replace(/^\/+|\/+$/g, "");
  }

  private fullPath(path: string): string {
    // Join prefix and path cleanly, avoiding duplicate slashes
    return [this.prefix, path].filter(Boolean).join("/").replace(/\/+/g, "/");
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
            this.clearToken();
            throw new ApiError("RefreshExpired", 401, "RefreshExpired");
          }

          if (error || !data?.accessToken) {
            this.clearToken();
            throw new ApiError(
              error?.message || "Refresh token failed",
              error?.statusCode || status || 500,
              "RefreshError"
            );
          }

          this.setToken(data.accessToken);
        } catch (err: any) {
          this.clearToken();
          throw err;
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
    const url = this.fullPath(path);
    const headers = {
      ...(opts.headers || {}),
      ...(this.accessToken
        ? { Authorization: `Bearer ${this.accessToken}` }
        : {}),
    };

    const callOpts: ApiOpts<T> = {
      ...opts,
      headers,
    };

    const { data, error, status } = await callApi<T>(method, url, callOpts);

    if (status === 401 && !isRetry) {
      try {
        await this.refreshToken();
        const cookies = document.cookie;
        console.log("cookies------->", cookies);
        return this.request(method, path, opts, true);
      } catch {
        throw new ApiError("RefreshFailed", 401, "RefreshFailed");
      }
    }

    if (error) {
      throw new ApiError(
        error?.message || "API error",
        error?.statusCode || status || 500,
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

  async patch<T>(path: string, body: any, opts?: ApiOpts<T>): Promise<T> {
    return this.request<T>("PATCH", path, { ...opts, body });
  }

  /**
   * Creates a namespaced client that shares the current access token
   */
  group(prefix: string): ApiClient {
    const namespace = prefix.trim().replace(/^\/+|\/+$/g, "");
    const client = new ApiClient(
      this.prefix ? `${this.prefix}/${namespace}` : namespace
    );
    if (this.accessToken) {
      client.setToken(this.accessToken);
    }
    return client;
  }
}

export const api = new ApiClient();

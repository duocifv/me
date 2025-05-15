import type { HttpMethod, ApiOpts } from "./types";
import { callApi } from "./callApi";
import { ApiError, errorHandler } from "./errorHandler";

/**
 * A robust API client with built-in token handling, refresh logic,
 * and namespace support for grouped endpoints.
 */
export class ApiClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<void> | null = null;
  private readonly prefix: string;

  constructor(prefix: string = "") {
    // Normalize prefix (remove leading/trailing slashes)
    this.prefix = prefix.replace(/^\/+|\/+$/g, "");
  }

  /** Sets the current access token in memory */
  setToken(token: string): void {
    this.accessToken = token;
  }

  /** Clears the current access token */
  clearToken(): void {
    this.accessToken = null;
  }

  /** Checks if an access token is present */
  hasToken(): boolean {
    return Boolean(this.accessToken);
  }

  /** Constructs full URL by joining prefix and path cleanly */
  private buildUrl(path: string): string {
    const url = [this.prefix, path].filter(Boolean).join("/");
    return url.replace(/\/\/+/, "/");
  }

  /**
   * Refreshes the access token using a singleton promise to avoid
   * concurrent refresh requests.
   */
  private async refreshToken(): Promise<void> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const { data, error, status } = await callApi<{
            accessToken: string;
          }>("POST", this.buildUrl("auth/token2"), { credentials: "include" });

          if (error || !data?.accessToken) {
            throw new ApiError("RefreshExpired", 401, "RefreshExpired");
          }

          this.setToken(data.accessToken);
        } catch (err: any) {
          this.clearToken();
          if (err instanceof ApiError && err.name === "RefreshExpired") {
            errorHandler.handle(err);
          } else {
            throw err;
          }
        } finally {
          this.refreshPromise = null;
        }
      })();
    }

    return this.refreshPromise;
  }

  /**
   * Internal request handler that injects token, handles errors,
   * and retries once after refreshing token if unauthorized.
   */
  private async request<T>(
    method: HttpMethod,
    path: string,
    opts: ApiOpts<T> = {},
    retry = true
  ): Promise<T> {
    console.log("this.accessToken", this.accessToken);
    const url = this.buildUrl(path);
    const headers = {
      ...opts.headers,
      ...(this.accessToken
        ? { Authorization: `Bearer ${this.accessToken}` }
        : {}),
    };

    const { data, error, status } = await callApi<T>(method, url, {
      ...opts,
      headers,
    });

    // Handle expired token: refresh and retry once
    if (status === 401 && retry) {
      await this.refreshToken();
      return this.request(method, path, opts, false);
    }

    if (error) {
      throw new ApiError(
        error.message || "API error",
        error.statusCode ?? status ?? 500,
        status === 401 ? "Unauthorized" : "ApiError"
      );
    }

    if (data == null) {
      throw new ApiError("Empty response", status ?? 500, "NoData");
    }

    return data;
  }

  /**
   * Creates a namespaced ApiClient that shares the same token and methods.
   */
  group(prefix: string): ApiClient {
    const namespace = prefix.replace(/^\/+|\/+$/g, "");
    const client = new ApiClient(this.buildUrl(namespace));

    // Share token state and methods
    Object.defineProperty(client, "accessToken", {
      get: () => this.accessToken,
      set: (val: string | null) => {
        this.accessToken = val;
      },
    });
    client.setToken = this.setToken.bind(this);
    client.clearToken = this.clearToken.bind(this);

    return client;
  }

  // Public HTTP methods
  get<T>(
    path: string,
    params?: Record<string, any>,
    opts?: ApiOpts<T>
  ): Promise<T> {
    return this.request<T>("GET", path, { ...opts, params });
  }

  post<T>(path: string, body?: any, opts?: ApiOpts<T>): Promise<T> {
    return this.request<T>("POST", path, { ...opts, body });
  }

  put<T>(path: string, body?: any, opts?: ApiOpts<T>): Promise<T> {
    return this.request<T>("PUT", path, { ...opts, body });
  }

  patch<T>(path: string, body?: any, opts?: ApiOpts<T>): Promise<T> {
    return this.request<T>("PATCH", path, { ...opts, body });
  }

  delete<T>(path: string, opts?: ApiOpts<T>): Promise<T> {
    return this.request<T>("DELETE", path, opts);
  }
}

/**
 * Singleton instance of ApiClient; use this for all API calls.
 */
export const api = new ApiClient();

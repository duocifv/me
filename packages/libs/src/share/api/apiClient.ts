import type { HttpMethod, ApiOpts } from "./types";
import { callApi } from "./callApi";
import { ApiError, errorHandler } from "./errorHandler";
import { getFingerprint } from "./fingerprint";
import { isTokenExpiringSoon } from "./jwt";
import { loginState } from "./authStorage";

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

  storage = {
    is: loginState.isLoggedIn,
    login: loginState.setLoggedIn,
    logout: loginState.clear,
  };

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

  redirectLogin(): void {
    window.location.replace("/en/login");
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
    const fingerprint = await getFingerprint();
    console.log("AccessToken login state:", this.storage.is());

    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const { data, error } = await callApi<{
            accessToken: string;
          }>("POST", "/auth/token", {
            credentials: "include",
            timeout: 3000,
            headers: {
              "X-Device-Fingerprint": fingerprint,
            },
          });

          if (error || !data?.accessToken) {
            this.clearToken();
            this.storage.logout();
            this.redirectLogin();
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
    // if (process.env.NODE_ENV === "development") {
    //   console.log("AccessToken:", this.accessToken);
    // }
    // console.log("AccessToken:", this.accessToken);

    console.log("opts -------->", opts);

    if (this.accessToken && isTokenExpiringSoon(this.accessToken)) {
      await this.refreshToken();
    }

    const url = this.buildUrl(path);
    const fingerprint = opts.useFingerprint ? await getFingerprint() : null;

    const mergedHeaders = {
      ...opts.headers,
      ...(fingerprint ? { "X-Device-Fingerprint": fingerprint } : {}),
      ...(this.accessToken
        ? { Authorization: `Bearer ${this.accessToken}` }
        : {}),
    };

    const { data, error, status } = await callApi<T>(method, url, {
      ...opts,
      headers: mergedHeaders,
    });

    // Handle expired token: refresh and retry once
    if (status === 401 && retry && this.storage.is()) {
      await this.refreshToken();
      return this.request(method, path, opts, false);
    }

    if (error) {
      const statusCode = error.statusCode ?? status ?? 500;

      if (statusCode === 400 && error.code === "CAPTCHA_REQUIRED") {
        throw new ApiError(
          error.message || "Vui lòng xác thực CAPTCHA",
          statusCode,
          "CaptchaRequired"
        );
      }

      throw new ApiError(
        error.message || "API error",
        error.statusCode ?? status ?? 500,
        status === 401 ? "Unauthorized" : "ApiError"
      );
    }

    console.log("data ------------>", data);

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
    path: string = "",
    params?: Record<string, any>,
    opts?: ApiOpts<T>
  ): Promise<T> {
    console.log("0", opts);
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

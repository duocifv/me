import type { HttpMethod, ApiOpts } from "./types";
import { callApi } from "./callApi";
import { ApiError, ErrorRespose } from "./Error";

export class ApiClient {
  private accessToken: string | null = null;

  setToken(token: string): void {
    this.accessToken = token;
  }

  clearToken(): void {
    this.accessToken = null;
  }

  hasToken(): boolean {
    return this.accessToken !== null;
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    opts: ApiOpts<T>= {}
  ): Promise<T> {
    if (!this.accessToken) {
      throw new ApiError("No access token — please login", 401, "AuthError");
    }

    const headers = {
      ...(opts.headers || {}),
      Authorization: `Bearer ${this.accessToken}`,
    };

    const callOpts = {
      ...opts,
      headers,
    };

    let res = await callApi<T>(method, path, callOpts);
    let { data, error, status } = res;

    if (status === 401) {
      const refreshRes = await callApi<void>("POST", "/auth/token", {
        credentials: "include",
      });
      if (refreshRes.error) {
        this.clearToken();
        throw new ApiError(refreshRes.error.message, refreshRes.error.statusCode, "RefreshError");
      }
      // Retry lần nữa
      res = await callApi<T>(method, path, callOpts);
      data = res.data;
      error = res.error;
      status = res.status as number;
    }

    if (error) {
      const errResp = error as ErrorRespose;
      throw new ApiError(errResp.message, errResp.statusCode, "ApiError");
    }
    if (data == null) {
      throw new ApiError("No data received", status, "ApiError");
    }
    return data;
  }

  get<T>(path: string, params?: Record<string, any>, opts?: ApiOpts<T>): Promise<T> {
    return this.request<T>("GET", path, { ...opts, params });
  }

  post<T>(path: string, body: Record<string, unknown>, opts?: ApiOpts<T>): Promise<T> {
    return this.request<T>("POST", path, { ...opts, body });
  }

  put<T>(path: string, body: Record<string, unknown>, opts?: ApiOpts<T>): Promise<T> {
    return this.request<T>("PUT", path, { ...opts, body });
  }

  delete<T>(path: string, opts?: ApiOpts<T>): Promise<T> {
    return this.request<T>("DELETE", path, opts || {});
  }
}

export const api = new ApiClient();
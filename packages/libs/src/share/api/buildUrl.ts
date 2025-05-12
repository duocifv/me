import { ReqParams } from "./types";
import { $config } from "../config/env";

/**
 * Builds a full API URL combining the base URL, endpoint path, and optional query parameters.
 *
 * - Skips any null or undefined values.
 * - Omits empty arrays or empty objects.
 * - Supports primitive types (string, number, boolean), arrays of primitives, and nested objects.
 *
 * @param {string} path - The endpoint path relative to the API base (e.g., 'users').
 * @param {ReqParams} [params] - An object containing query parameters to encode.
 *   - If a value is a primitive, it is appended directly.
 *   - If a value is an array, each element is appended as a separate key (only if array length > 0).
 *   - If a value is an object, it is JSON.stringified (only if object has keys).
 * @returns {string} The complete URL, including the query string if parameters exist.
 *
 * @example
 * // build: https://api.example.com/users?page=1&roles=ADMIN&roles=MANAGER
 * makeUrl('users', { page: 1, roles: ['ADMIN', 'MANAGER'] });
 */
export const makeUrl = (path: string, params?: ReqParams): string => {
  const baseUrl = $config.API_URL.replace(/\/+$/g, "");
  const cleanPath = path.trim().replace(/^\/+|\/+$/g, "");
  const base = cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
  if (!params || Object.keys(params).length === 0) return base;

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;

    if (Array.isArray(value) && value.length > 0) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else if (typeof value === "object") {
      if (Object.keys(value).length === 0) return;
      searchParams.append(key, JSON.stringify(value));
    } else {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return `${base}?${queryString}`;
};

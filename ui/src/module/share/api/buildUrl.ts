import { $config } from "../config/env";
import { ReqParams } from "./types";

export const makeUrl = (
  path: string,
  params?: ReqParams | unknown[]
): string => {
  // nếu front-end đóng gói object trong 'params', hãy lấy luôn cái bên trong
  let realParams = params as any;
  if (realParams && typeof realParams === "object" && "params" in realParams) {
    realParams = realParams.params;
  }

  const baseUrl = $config.API_URL.replace(/\/+$/g, "");
  const cleanPath = path.trim().replace(/^\/+|\/+$/g, "");
  const base = cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;

  if (!realParams || Object.keys(realParams).length === 0) {
    return base;
  }

  const searchParams = new URLSearchParams();

  Object.entries(realParams).forEach(([key, value]) => {
    if (value == null) return;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (["string", "number", "boolean"].includes(typeof v)) {
          searchParams.append(key, String(v));
        }
      });
      return;
    }

    if (["string", "number", "boolean"].includes(typeof value)) {
      searchParams.append(key, String(value));
      return;
    }

    // các object con khác bỏ qua
  });

  const qs = searchParams.toString();
  return qs ? `${base}?${qs}` : base;
};

import { $config } from "../config/env";

const isDev = $config.NODE_ENV === "development";
const timestamp = () => new Date().toISOString();

export const log = {
  info: (msg: string) => isDev && console.log(`[INFO] ${timestamp()} - ${msg}`),
  error: (msg: string) =>
    isDev && console.error(`[ERROR] ${timestamp()} - ${msg}`),
  warn: (msg: string) =>
    isDev && console.warn(`[WARN] ${timestamp()} - ${msg}`),
  ok: (msg: string) => isDev && console.log(`[OK] ${timestamp()} - ${msg}`),
};
